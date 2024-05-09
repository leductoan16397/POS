import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from 'src/module/common/config/config.module';
import { ConfigService } from 'src/module/common/config/config.service';
import { JwtStrategy } from './guard/jwt.strategy';
import { RefreshTokenModule } from '../refresh_token/refresh.token.module';
import { OnModuleInit } from '@nestjs/common';
import { Company } from '../company/entity/company.entity';
import { MailModule } from 'src/module/common/mail/mail.module';
import { BlockOTP, OtpCode } from './entity/otp.entity';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [
    TenancyModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, Company, OtpCode, BlockOTP]),
    RefreshTokenModule,
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get().auth.access_token_secret,
          signOptions: { expiresIn: configService.get().auth.token_expire_time },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly authService: AuthService) {}

  async onModuleInit() {
    await this.authService.createSuperAdmin();
  }
}
