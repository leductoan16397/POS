import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.response';
import { BackOfficePermission, POSPermission, TENANT_SCHEMA } from 'src/common/constant';
import { CompanyStatus, UserRole } from 'src/common/enum';
import { TokenPayload } from 'src/common/type';
import { genPin, generateSalt } from 'src/common/utils';
import { MailService } from 'src/module/common/mail/mail.service';
import { TenancyService } from 'src/module/common/tenancy/tenantcy.service';
import { AccessGroup } from 'src/module/tenanted/group/entity/group.entity';
import { Store } from 'src/module/tenanted/store/entity/store.entity';
import { TenantUser } from 'src/module/tenanted/user/entity/tenant.user.entity';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CompanyConfig } from '../company_config/entity/company.config.entity';
import { RefreshTokenService } from '../refresh_token/refresh.token.service';
import { User } from '../user/entity/user.entity';
import { FindCompanyDto, RegisterCompanyDto } from './dto/company.dto';
import { Company } from './entity/company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyConfig) private readonly companyConfigRepository: Repository<CompanyConfig>,
    @InjectDataSource() private readonly connection: DataSource,
    private readonly tenancyService: TenancyService,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailService: MailService,
  ) {}

  async registerCompany({
    businessName,
    country,
    password,
    email,
    language,
    timezone,
    address,
    city,
    state,
    zipCode,
    currency,
    currencyCode,
    currencySymbol,
    taxCode,
    decimalPlaces,
  }: RegisterCompanyDto) {
    // check username
    const existUser = await this.userRepository.countBy({ email: email.trim().toLowerCase() });

    if (existUser) {
      throw new BadRequestException('User already exists');
    }
    try {
      const queryRunner = this.connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();
      const companyUser = new User();

      companyUser.email = email.trim().toLowerCase();
      companyUser.role = UserRole.CompanyOwner;
      companyUser.name = 'Owner';
      companyUser.country = country;
      companyUser.pin = genPin();

      // hash password
      companyUser.salt = generateSalt();
      companyUser.hashedPassword = this.authService.encodePassword({ password, salt: companyUser.salt });

      const companyConfig = new CompanyConfig();
      const company = new Company();
      try {
        // Store user company admin
        const user = await queryRunner.manager.save(companyUser);

        companyConfig.createdBy = user;
        companyConfig.language = language || 'en';
        companyConfig.timezone = timezone || 'Asia/Ho_Chi_Minh';
        companyConfig.countryId = country || 'VN';
        companyConfig.address = address;
        companyConfig.city = city;
        companyConfig.state = state;
        companyConfig.zipCode = zipCode;
        companyConfig.currency = currency || 'USD Dollar';
        companyConfig.currencyCode = currencyCode || 'USD';
        companyConfig.currencySymbol = currencySymbol || '$';
        companyConfig.taxCode = taxCode || null;
        companyConfig.decimalPlaces = decimalPlaces || 2;
        await queryRunner.manager.save(companyConfig);

        company.businessName = businessName;
        company.ownerEmail = email.trim().toLowerCase();
        company.createdBy = user;
        company.status = CompanyStatus.Active;
        company.config = companyConfig;
        company.key = Date.now().toString();

        const storedCompany = await queryRunner.manager.save(company);

        user.companyId = storedCompany.id;

        await queryRunner.manager.save(company);

        await queryRunner.manager.save(user);

        const schemaName = `${TENANT_SCHEMA}${company.key}`;
        await this.connection.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

        await queryRunner.commitTransaction();
      } catch (err) {
        console.log(
          `${new Date().toString()} 🚀 ~ file: company.service.ts:84 ~ CompanyService ~ registerCompany ~ err:`,
          err,
        );
        // since we have errors lets rollback the changes we made
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        // you need to release a queryRunner which was manually instantiated
        await queryRunner.release();
      }

      const connection = await this.tenancyService.getTenantConnection(`${company.key}`);
      await connection.runMigrations();

      await this.onCreatedCompany({ company, companyUser, connection });

      const payload: Omit<TokenPayload, 'type'> = {
        email: email.trim().toLowerCase(),
        id: companyUser.id,
        role: companyUser.role,
        tenantId: company.key,
      };

      // gen token
      const access_token = this.authService.genAccessToken(payload);
      const refresh_token = this.authService.genRefreshToken(payload);

      await this.refreshTokenService.storeToken({ token: refresh_token, user: companyUser });

      // send email
      this.mailService.companyCreated({ businessName, email }).catch((err) => {
        console.log(
          `${new Date().toString()} 🚀 ~ file: company.service.ts:136 ~ CompanyService ~ this.mailService.companyCreated ~ err:`,
          err,
        );
      });

      return {
        name: companyUser.name,
        email: companyUser.email.trim().toLowerCase(),
        id: companyUser.id,
        access_token,
        refresh_token,
        role: companyUser.role,
        ...(await this.authService.companyPermissions({ company, user: companyUser })),
      };
    } catch (error) {
      throw error;
    }
  }

  async onCreatedCompany({
    company,
    companyUser,
    connection,
  }: {
    connection: DataSource;
    companyUser: User;
    company: Company;
  }) {
    const tenantUserRepository: Repository<TenantUser> = connection.getRepository(TenantUser);
    const storeRepository: Repository<Store> = connection.getRepository(Store);
    const tenantUserGroupRepository: Repository<AccessGroup> = connection.getRepository(AccessGroup);

    // create owner group
    const ownerGroup = tenantUserGroupRepository.create({
      name: 'Owner',
      deleteAble: false,
      updateAble: false,
      assignAble: false,
      isManagePos: true,
      isManageBackOffice: true,
      managePos: Object.values(POSPermission),
      manageBackOffice: Object.values(BackOfficePermission),
    });

    // clone user
    const tenantUser = new TenantUser();
    tenantUser.userId = companyUser.id;
    tenantUser.role = companyUser.role;
    tenantUser.name = companyUser.name;
    tenantUser.email = companyUser.email;
    tenantUser.group = ownerGroup;
    tenantUser.deleteAble = false;

    // Create default store
    const store = storeRepository.create({ name: company.businessName, description: '', phone: '', address: '' });

    await Promise.all([
      tenantUserGroupRepository.save(ownerGroup),
      storeRepository.save(store),
      tenantUserRepository.save(tenantUser),
    ]);
  }

  async find({
    page = 0,
    pageSize = 10,
    order = 'asc',
    sort = 'ownerEmail',
    search,
  }: FindCompanyDto): Promise<Pagination<Company>> {
    const where: FindOptionsWhere<Company> | FindOptionsWhere<Company>[] =
      (search && [
        {
          businessName: ILike(`%${search.trim().toLowerCase()}%`),
        },
        {
          ownerEmail: ILike(`%${search.trim().toLowerCase()}%`),
        },
      ]) ||
      {};

    const [data, total] = await this.companyRepository.findAndCount({
      where,
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    return { data, page, pageSize, total, totalPage: Math.ceil(total / pageSize) };
  }

  async changeStatus({ companyId, status }: { companyId: string; status: CompanyStatus }) {
    const company = await this.companyRepository.findOneBy({ id: companyId });

    if (!company) {
      throw new BadRequestException('Company Not Found');
    }

    return this.companyRepository.save({
      id: companyId,
      status,
    });
  }
}
