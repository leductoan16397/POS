import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/module/common/mail/mail.service';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';
import { Company } from 'src/module/public/company/entity/company.entity';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { TransactionHistoryController } from './transaction.history.controller';
import { TransactionHistoryService } from './transaction.history.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, CompanyConfig]), TenancyModule],
  providers: [TransactionHistoryService, MailService],
  controllers: [TransactionHistoryController],
})
export class TransactionHistoryModule {}
