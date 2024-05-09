import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyConfigController } from './company.config.controller';
import { CompanyConfigService } from './company.config.service';
import { CompanyConfig } from './entity/company.config.entity';
import { User } from '../user/entity/user.entity';
import { Company } from '../company/entity/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User, CompanyConfig])],
  providers: [CompanyConfigService],
  controllers: [CompanyConfigController],
})
export class CompanyConfigModule {}
