import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entity/user.entity';
import { CompanyConfig } from '../company_config/entity/company.config.entity';
import { RefreshTokenModule } from '../refresh_token/refresh.token.module';
import { MailModule } from 'src/module/common/mail/mail.module';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, CompanyConfig]),
    AuthModule,
    RefreshTokenModule,
    MailModule,
    TenancyModule,
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
