import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantUserController } from './tenant.user.controller';
import { TenantUserService } from './tenant.user.service';
import { User } from 'src/module/public/user/entity/user.entity';
import { AuthModule } from 'src/module/public/auth/auth.module';
import { MailModule } from 'src/module/common/mail/mail.module';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, MailModule, TenancyModule],
  providers: [TenantUserService],
  controllers: [TenantUserController],
})
export class TenantUserModule {}
