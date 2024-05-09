import { Module } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CompanyConfigModule } from './company_config/company.config.module';
import { RefreshTokenModule } from './refresh_token/refresh.token.module';

@Module({
  imports: [CompanyModule, CompanyConfigModule, UserModule, AuthModule, RefreshTokenModule],
  providers: [],
  controllers: [],
})
export class PublicModule {}
