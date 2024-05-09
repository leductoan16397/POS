import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'src/module/common/config/config.service';
import { createHmac } from 'crypto';
import { LoggedUser, TokenPayload, TokenType } from 'src/common/type';
import { LoginDTO, ResetPasswordDTO, SelfUpdateUserDto } from './dto/auth.dto';
import { RefreshTokenService } from '../refresh_token/refresh.token.service';
import { CompanyStatus, UserRole } from 'src/common/enum';
import { genPin, generateSalt } from 'src/common/utils';
import { Company } from '../company/entity/company.entity';
import { TenancyService } from 'src/module/common/tenancy/tenantcy.service';
import { TenantUser } from 'src/module/tenanted/user/entity/tenant.user.entity';
import { MailService } from 'src/module/common/mail/mail.service';
import { BlockOTP, BlockOTPStatus, OTP_ACTION, OtpCode } from './entity/otp.entity';
import * as moment from 'moment-timezone';

@Injectable()
export class AuthService {
  limitNumberToBlockOtp: number;
  limitMinutesExpireBlockOtp: number;
  limitMinutesExpireOtpCode: number;
  limitInvalidInputOtp: number;

  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpireTime: string;
  private readonly bcryptSalt: string;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(OtpCode) private readonly otpCodeRepository: Repository<OtpCode>,
    @InjectRepository(BlockOTP) private readonly blockOTPRepository: Repository<BlockOTP>,

    private readonly refreshTokenService: RefreshTokenService,

    private jwtService: JwtService,
    private readonly mailService: MailService,

    private readonly tenancyService: TenancyService,
  ) {
    this.refreshTokenSecret = this.configService.get().auth.refresh_token_secret;
    this.refreshTokenExpireTime = this.configService.get().auth.refresh_token_expire_time;
    this.bcryptSalt = this.configService.get().auth.bcrypt_salt;

    this.limitNumberToBlockOtp = 3;
    this.limitMinutesExpireBlockOtp = 10;
    this.limitMinutesExpireOtpCode = 15;
    this.limitInvalidInputOtp = 10;
  }

  encodePassword({ password, salt }: { password: string; salt: string }) {
    const hash = createHmac('sha256', this.bcryptSalt)
      .update(password + salt)
      .digest('hex');

    return hash;
  }

  private verifyPassword({ hashPassword, password, salt }: { password: string; hashPassword: string; salt: string }) {
    return hashPassword === this.encodePassword({ password, salt });
  }

  async validateUser({ id, email, tenantId }: TokenPayload): Promise<LoggedUser> {
    const user = await this.userRepository.findOneBy({ email: email.trim().toLowerCase() });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id,
      role: user.role,
      email: user.email.trim().toLowerCase(),
      tenantId,
    };
  }

  genAccessToken(payload: Omit<TokenPayload, 'type'>) {
    return this.jwtService.sign({ ...payload, type: TokenType.access });
  }

  genRefreshToken(payload: Omit<TokenPayload, 'type'>) {
    return this.jwtService.sign(
      { ...payload, type: TokenType.refresh },
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpireTime,
      },
    );
  }

  async refreshToken({ token }: { token: string }) {
    try {
      const payload: TokenPayload = await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecret,
      });

      const user = await this.userRepository.findOne({
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid Token');
      }

      const refreshToken = await this.refreshTokenService.findOne({
        where: {
          token: token,
          user: {
            id: user.id,
          },
        },
      });

      if (!refreshToken) {
        throw new BadRequestException('Invalid Token');
      }

      let tenantId: string;
      if (user.companyId) {
        const company = await this.companyRepository.findOneBy({ id: user.companyId });
        tenantId = company?.key;
      }

      const access_token = this.genAccessToken({
        email: user.email.trim().toLowerCase(),
        id: user.id,
        role: user.role,
        tenantId,
      });

      return { access_token };
    } catch (error) {
      throw error;
    }
  }

  async login({ password, email }: LoginDTO) {
    // verify user
    const user = await this.userRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        name: true,
        role: true,
        salt: true,
        hashedPassword: true,
        email: true,
        companyId: true,
        phone: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    // verify password
    const verifyPassword = this.verifyPassword({ hashPassword: user.hashedPassword, password, salt: user.salt });

    if (!verifyPassword) {
      throw new BadRequestException('Invalid username or password');
    }

    let rs = {};

    let tenantId: string;
    if (user.companyId) {
      const company = await this.companyRepository.findOneBy({ id: user.companyId });
      console.log(`${new Date().toString()} 🚀 ~ file: auth.service.ts:178 ~ AuthService ~ login ~ company:`, company);
      if (company.status !== CompanyStatus.Active) {
        throw new BadRequestException('Access Denied');
      }
      tenantId = company?.key;
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.service.ts:183 ~ AuthService ~ login ~ tenantId:`,
        tenantId,
      );

      rs = {
        ...rs,
        ...(await this.companyPermissions({ company, user })),
      };
    }

    const payload: Omit<TokenPayload, 'type'> = {
      email: email.trim().toLowerCase(),
      id: user.id,
      role: user.role,
      tenantId,
    };

    // gen token
    const access_token = this.genAccessToken(payload);
    const refresh_token = this.genRefreshToken(payload);

    await this.refreshTokenService.storeToken({ token: refresh_token, user });
    // store token
    rs = {
      ...rs,
      name: user.name,
      email: user.email.trim().toLowerCase(),
      id: user.id,
      access_token,
      refresh_token,
      role: user.role,
      phone: user.phone,
    };
    return rs;
  }

  async createSuperAdmin() {
    const user = {
      email: 'haibai@gmail.com',
      password: 'haibai1234',
      role: UserRole.POSAdmin,
      name: 'haibai',
      country: 'VN',
    };

    const superAdmin = await this.userRepository.findOne({
      where: {
        email: user.email.trim().toLowerCase(),
      },
    });
    if (superAdmin) {
      return;
    }

    const newSuperAdmin = new User();

    newSuperAdmin.country = 'VN';
    newSuperAdmin.email = user.email.trim().toLowerCase();
    newSuperAdmin.role = user.role;
    newSuperAdmin.name = user.name;
    newSuperAdmin.pin = genPin();
    newSuperAdmin.salt = generateSalt();
    newSuperAdmin.hashedPassword = this.encodePassword({ password: user.password, salt: newSuperAdmin.salt });
    const u = await this.userRepository.save(newSuperAdmin);
    console.log(`${new Date().toString()} 🚀 ~ file: auth.service.ts:172 ~ AuthService ~ createSuperAdmin ~ u:`, u);
  }

  async me({ loggedUser }: { loggedUser: LoggedUser }) {
    const user = await this.userRepository.findOneBy({ id: loggedUser.id });

    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    if (user.companyId) {
      const company = await this.companyRepository.findOneBy({ id: user.companyId });
      if (company.status !== CompanyStatus.Active) {
        throw new BadRequestException('Access Denied');
      }

      return {
        ...user,
        businessName: company?.businessName,
        ...(await this.companyPermissions({ company, user })),
      };
    }

    return user;
  }

  async companyPermissions({ company, user }: { company: Company; user: User }) {
    const connection = await this.tenancyService.getTenantConnection(`${company.key}`);
    const tenantUserRepository: Repository<TenantUser> = connection.getRepository(TenantUser);
    const companyUser = await tenantUserRepository.findOne({
      where: {
        userId: user.id,
      },
      relations: {
        group: true,
      },
    });

    return {
      isManageBackOffice: companyUser.group?.isManageBackOffice,
      isManagePos: companyUser.group?.isManagePos,
      manageBackOffice: companyUser.group?.manageBackOffice,
      managePos: companyUser.group?.managePos,
    };
  }

  async registerOtp({ action, email }: { email: string; action: OTP_ACTION }) {
    const checkUser = await this.userRepository.findOneBy({ email: email.toLowerCase().trim() });
    if (action === OTP_ACTION.signup) {
      if (checkUser) {
        throw new BadRequestException('User Already Exist');
      }
    }

    if (action === OTP_ACTION.resetPassword) {
      if (!checkUser) {
        throw new BadRequestException('User Does Not Exist');
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    const currentTime = moment();
    let isDelayTime = false;

    const tmpOtpCode = await this.otpCodeRepository.findOne({
      where: { email: email.toLowerCase().trim(), action },
      order: { createdAt: 'DESC' },
    });

    if (tmpOtpCode) {
      const checkTime = moment(tmpOtpCode.createdAt).add(30, 'seconds');
      if (checkTime > currentTime) {
        console.log('delay >>>>>>>>>');
        isDelayTime = true;
      } else {
        console.log('remove code >>>>>>>>>');
        await this.otpCodeRepository.delete({ id: tmpOtpCode.id });
      }
    }

    if (isDelayTime) {
      throw new BadRequestException('CanNot Request Continuously');
    }

    let blockOtp = await this.blockOTPRepository.findOne({
      where: {
        email: email.toLowerCase().trim(),
        expireTime: MoreThan(currentTime.toDate()),
        status: BlockOTPStatus.normal,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (blockOtp) {
      if (blockOtp.numRequest > this.limitNumberToBlockOtp) {
        throw new BadRequestException('Can not request many time, please take a rest and try again after 10 minutes');
      }

      await this.blockOTPRepository.save({
        id: blockOtp.id,
        numRequest: blockOtp.numRequest + 1,
      });
    } else {
      blockOtp = await this.blockOTPRepository.findOne({
        where: {
          email: email.toLowerCase().trim(),
          expireTime: MoreThan(currentTime.toDate()),
          status: BlockOTPStatus.block,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      if (blockOtp) {
        throw new BadRequestException('Can not request many time, please take a rest and try again after 10 minutes');
      }

      await this.blockOTPRepository.delete({ email: email.toLowerCase().trim() });

      const newBlockOtp = this.blockOTPRepository.create({
        email: email.toLowerCase().trim(),
        numRequest: 1,
        expireTime: moment().add(this.limitMinutesExpireBlockOtp, 'minutes').toDate(),
        status: BlockOTPStatus.normal,
      });
      await this.blockOTPRepository.save(newBlockOtp);
    }

    const codeExpireTime = moment().add(this.limitMinutesExpireOtpCode, 'minutes').toDate();

    const otpCode = this.otpCodeRepository.create({
      action,
      email: email.toLowerCase().trim(),
      code: code.toString(),
      limitInvalid: this.limitInvalidInputOtp,
      expireTime: codeExpireTime,
      currentValid: 0,
    });

    await this.otpCodeRepository.save(otpCode);

    this.mailService
      .sendOtp({
        otp: code.toString(),
        email: email.toLowerCase().trim(),
      })
      .catch((error) => {
        console.log(
          `${new Date().toString()} 🚀 ~ file: auth.service.ts:390 ~ AuthService ~ registerOtp ~ error:`,
          error,
        );
      });
  }

  async quickVerifyOtp({ code, email, action }: { code: string; email: string; action: OTP_ACTION }) {
    return this.verifyOtp({ code, email: email.toLowerCase().trim(), action, quickCheck: true });
  }

  async verifyOtp({
    code,
    email,
    quickCheck,
    action,
  }: {
    code: string;
    email: string;
    action: OTP_ACTION;
    quickCheck?: boolean;
  }) {
    try {
      const tmpCurrentOtp = await this.otpCodeRepository.findOne({
        where: {
          email: email.toLowerCase().trim(),
          ...(action && { action }),
        },
        order: {
          createdAt: -1,
        },
      });

      if (!tmpCurrentOtp) {
        throw new BadRequestException('Code does not exist');
      }

      if (tmpCurrentOtp.code != code) {
        const curInvalid = tmpCurrentOtp.currentValid;

        if (curInvalid > 10) {
          await this.otpCodeRepository.delete({ id: tmpCurrentOtp.id });

          throw new BadRequestException('Sent too many OTP, please try again later');
        }

        await this.otpCodeRepository.save({
          id: tmpCurrentOtp.id,
          currentValid: curInvalid + 1,
        });
        throw new BadRequestException('The OTP code is invalid');
      }

      if (!quickCheck) {
        await this.otpCodeRepository.delete({ id: tmpCurrentOtp.id });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async changePassword({
    loggedUser,
    oldPassword,
    newPassword,
  }: {
    loggedUser: LoggedUser;
    oldPassword: string;
    newPassword: string;
  }) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: loggedUser.id,
        },
        select: {
          salt: true,
          hashedPassword: true,
          id: true,
        },
      });

      const verifyPassword = this.verifyPassword({
        hashPassword: user.hashedPassword,
        password: oldPassword,
        salt: user.salt,
      });

      if (!verifyPassword) {
        throw new BadRequestException('Invalid password');
      }

      const hashedPassword = this.encodePassword({ password: newPassword, salt: user.salt });
      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          hashedPassword,
        },
      );

      return {
        isUpdated: true,
      };
    } catch (ex) {
      throw ex;
    }
  }

  async resetPassword({ code, email, newPassword: password }: ResetPasswordDTO) {
    await this.verifyOtp({ code, email: email.toLowerCase().trim(), action: OTP_ACTION.resetPassword });

    try {
      const user = await this.userRepository.findOne({
        where: {
          email: email.toLowerCase().trim(),
        },
        select: {
          salt: true,
          hashedPassword: true,
          id: true,
          companyId: true,
          role: true,
          email: true,
        },
      });

      if (!user) {
        throw new BadRequestException('User Not Found');
      }

      const hashedPassword = this.encodePassword({ password, salt: user.salt });
      await this.userRepository.save({
        id: user.id,
        hashedPassword,
      });

      let rs = {};

      let tenantId: string;
      if (user.companyId) {
        const company = await this.companyRepository.findOneBy({ id: user.companyId });
        if (company.status !== CompanyStatus.Active) {
          throw new BadRequestException('Access Denied');
        }
        tenantId = company?.key;

        rs = {
          ...rs,
          ...(await this.companyPermissions({ company, user })),
        };
      }

      const payload: Omit<TokenPayload, 'type'> = {
        email: email.trim().toLowerCase(),
        id: user.id,
        role: user.role,
        tenantId,
      };

      // gen token
      const access_token = this.genAccessToken(payload);
      const refresh_token = this.genRefreshToken(payload);

      await this.refreshTokenService.storeToken({ token: refresh_token, user });

      rs = {
        ...rs,
        name: user.name,
        email: user.email.trim().toLowerCase(),
        id: user.id,
        access_token,
        refresh_token,
        role: user.role,
      };
      return rs;
    } catch (error) {
      throw error;
    }
  }

  async selfUpdate({ input, loggedUser }: { loggedUser: LoggedUser; input: SelfUpdateUserDto }) {
    const { name, pin, phone } = input;
    const user = await this.userRepository.findOneBy({ id: loggedUser.id });

    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    let connection: DataSource;
    let tenantUserRepository: Repository<TenantUser>;
    if (user.companyId) {
      const company = await this.companyRepository.findOneBy({ id: user.companyId });
      if (!company) {
        throw new BadRequestException('User Not Found');
      }

      connection = await this.tenancyService.getTenantConnection(`${company.key}`);

      tenantUserRepository = connection.getRepository(TenantUser);
    }

    await this.userRepository.update(
      {
        id: loggedUser.id,
      },
      {
        name,
        phone,
        pin,
      },
    );

    tenantUserRepository &&
      (await tenantUserRepository.update(
        {
          userId: loggedUser.id,
        },
        {
          name,
        },
      ));

    // connection && (await connection.destroy());

    return this.me({ loggedUser });
  }
}
