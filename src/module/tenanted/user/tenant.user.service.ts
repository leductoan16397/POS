import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { CONNECTION } from 'src/module/common/tenancy/tenantcy.symbol';
import { TenantUser } from './entity/tenant.user.entity';
import { CreateTenantUserDto, FindTenantUserListDto, UpdateTenantUserDto } from './dto/tenant.user.dto';
import { TenantUserData } from './response/tenant.user.res';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/module/public/user/entity/user.entity';
import { UserRole } from 'src/common/enum';
import { generateSalt, randomString } from 'src/common/utils';
import { AccessGroup } from '../group/entity/group.entity';
import { AuthService } from 'src/module/public/auth/auth.service';
import { Pagination } from 'src/common/common.response';
import { LoggedUser } from 'src/common/type';
import * as lodash from 'lodash';
import { MailService } from 'src/module/common/mail/mail.service';

@Injectable()
export class TenantUserService {
  private readonly tenantUserRepository: Repository<TenantUser>;
  private readonly tenantUserGroupRepository: Repository<AccessGroup>;
  private readonly connection: DataSource;
  constructor(
    @Inject(CONNECTION) connection: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {
    this.tenantUserRepository = connection.getRepository(TenantUser);
    this.tenantUserGroupRepository = connection.getRepository(AccessGroup);
    this.connection = connection;
  }

  async create({ input, loggedUser }: { input: CreateTenantUserDto; loggedUser: LoggedUser }) {
    const { email, group, name, pin, phone, inviteBackOffice } = input;
    console.log(
      `${new Date().toString()} 🚀 ~ file: tenant.user.service.ts:34 ~ TenantUserService ~ create ~ inviteBackOffice:`,
      inviteBackOffice,
    );
    // check username
    const existUser = await this.userRepository.findOne({
      where: { email: email.trim().toLowerCase() },
      withDeleted: true,
    });

    if (existUser && !existUser.deletedAt) {
      throw new BadRequestException('User already exists');
    }

    if (existUser?.deletedAt) {
      // re-active account
      // throw new BadRequestException('User already exists');
      return this.activeAccount({ input, loggedUser });
    }

    const userGroup = (group && (await this.tenantUserGroupRepository.findOneBy({ id: group }))) || null;
    if (!!userGroup && !userGroup.assignAble) {
      throw new BadRequestException('Cannot Assign Employee To This Group');
    }
    // create user in pos shcema

    const currentUser = await this.userRepository.findOneBy({ id: loggedUser.id });

    const companyUser = this.userRepository.create({
      email: email.trim().toLowerCase(),
      role: UserRole.CompanyUser,
      name,
      pin,
      phone,
      salt: generateSalt(),
      companyId: currentUser.companyId,
      country: currentUser.country,
    });

    const password = randomString(9);

    companyUser.hashedPassword = this.authService.encodePassword({
      password: password,
      salt: companyUser.salt,
    });

    await this.userRepository.save(companyUser);

    // create user in tenant schema
    // assign user to group
    const tenantUser = this.tenantUserRepository.create({
      email,
      name,
      userId: companyUser.id,
      role: companyUser.role,
      group: userGroup,
      inviteBackOffice,
    });

    await this.tenantUserRepository.save(tenantUser);

    // send mail
    this.mailService.employeeCreated({ email, password: password }).catch((err) => {
      console.log(
        `${new Date().toString()} 🚀 ~ file: tenant.user.service.ts:88 ~ TenantUserService ~ create ~ err:`,
        err,
      );
    });

    return new TenantUserData({
      createdAt: tenantUser.createdAt,
      email: companyUser.email,
      id: tenantUser.id,
      name: companyUser.name,
      pin: companyUser.pin,
      role: companyUser.role,
      updatedAt: tenantUser.updatedAt,
      deleteAble: tenantUser.deleteAble,
      group: tenantUser.group,
      phone: companyUser.phone,
      inviteBackOffice,
    });
  }

  async activeAccount({ input }: { input: CreateTenantUserDto; loggedUser: LoggedUser }) {
    const { email, inviteBackOffice, name, pin, group, phone } = input;
    const userGroup = (group && (await this.tenantUserGroupRepository.findOneBy({ id: group }))) || null;
    if (!!userGroup && !userGroup.assignAble) {
      throw new BadRequestException('Cannot Assign Employee To This Group');
    }

    const companyUser = await this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
      select: {
        salt: true,
        id: true,
      },
      withDeleted: true,
    });
    const password = randomString(9);

    const hashedPassword = this.authService.encodePassword({
      password: password,
      salt: companyUser.salt,
    });

    await this.userRepository.update(
      {
        id: companyUser.id,
      },
      {
        hashedPassword,
        name,
        pin,
        phone,
      },
    );

    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        userId: companyUser.id,
      },
      withDeleted: true,
    });

    await this.tenantUserRepository.update(
      {
        id: tenantUser.id,
      },
      {
        name,
        inviteBackOffice,
        group: userGroup,
      },
    );

    await this.userRepository.restore({ id: companyUser.id });

    await this.tenantUserRepository.restore({
      id: tenantUser.id,
    });

    // send mail
    this.mailService.employeeCreated({ email, password: password }).catch((err) => {
      console.log(
        `${new Date().toString()} 🚀 ~ file: tenant.user.service.ts:173 ~ TenantUserService ~ activeAccount ~ err:`,
        err,
      );
    });

    return new TenantUserData({
      createdAt: tenantUser.createdAt,
      email: companyUser.email,
      id: tenantUser.id,
      name: companyUser.name,
      pin: companyUser.pin,
      role: companyUser.role,
      updatedAt: tenantUser.updatedAt,
      deleteAble: tenantUser.deleteAble,
      group: tenantUser.group,
      phone: companyUser.phone,
      inviteBackOffice,
    });
  }

  async find({
    query: { page = 0, pageSize = 10, order = 'asc', sort = 'name', search },
    loggedUser,
  }: {
    query: FindTenantUserListDto;
    loggedUser: LoggedUser;
  }): Promise<Pagination<TenantUserData>> {
    const currentUser = await this.userRepository.findOneBy({ id: loggedUser.id });
    const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = (search && [
      {
        name: ILike(`%${search.trim().toLowerCase()}%`),
        companyId: currentUser.companyId,
      },
      {
        email: ILike(`%${search.trim().toLowerCase()}%`),
        companyId: currentUser.companyId,
      },
    ]) || {
      companyId: currentUser.companyId,
    };

    const users = await this.userRepository.find({
      where,
      order: {
        [sort]: order,
      },
      take: pageSize,
      skip: page * pageSize,
    });

    const [data, total] = await this.tenantUserRepository.findAndCount({
      where: {
        userId: In(users.map((u) => u.id)),
      },
      relations: {
        group: true,
      },
    });

    return {
      data: lodash.orderBy(
        data.map((d) => {
          const user = users.find((u) => u.id === d.userId);
          return new TenantUserData({
            createdAt: d.createdAt,
            deleteAble: d.deleteAble,
            email: user.email,
            id: d.id,
            name: user.name,
            pin: user.pin,
            role: user.role,
            updatedAt: d.updatedAt,
            group: d.group,
            phone: user.phone,
            inviteBackOffice: d.inviteBackOffice,
          });
        }),
        [sort],
        [order],
      ),
      page,
      pageSize,
      total,
      totalPage: Math.ceil(total / pageSize),
    };
  }

  async update({ id, updateInput }: { id: string; updateInput: UpdateTenantUserDto }) {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { id },
    });

    if (!tenantUser) {
      throw new BadRequestException('User Not Found');
    }

    const { group, name, phone, pin } = updateInput;

    if (group) {
      const userGroup = await this.tenantUserGroupRepository.findOneBy({ id: group });
      if (!userGroup) {
        throw new BadRequestException('Group Not Found');
      }
      await this.tenantUserRepository.save({
        id: tenantUser.id,
        group: userGroup,
      });
    }

    await this.userRepository.save({
      id: tenantUser.userId,
      name,
      phone,
      pin,
    });
    await this.tenantUserRepository.save({
      id: tenantUser.id,
      name,
    });

    return this.findOne({ id: tenantUser.id });
  }

  async findOne({ id }: { id: string }) {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { id },
      relations: {
        group: true,
      },
    });
    const user = await this.userRepository.findOne({
      where: { id: tenantUser.userId },
    });
    return new TenantUserData({
      createdAt: tenantUser.createdAt,
      deleteAble: tenantUser.deleteAble,
      email: user.email,
      id: tenantUser.id,
      name: user.name,
      pin: user.pin,
      role: user.role,
      updatedAt: tenantUser.updatedAt,
      group: tenantUser.group,
      phone: user.phone,
      inviteBackOffice: tenantUser.inviteBackOffice,
    });
  }

  async remove({ id }: { id: string }) {
    const user = await this.tenantUserRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    if (!user.deleteAble) {
      throw new BadRequestException('Cannot delete this user');
    }

    const rs = await this.tenantUserRepository.softDelete({ id });
    await this.userRepository.softDelete({ id: user.userId });
    return rs;
  }
}
