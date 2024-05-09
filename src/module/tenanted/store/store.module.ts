import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';
import { User } from 'src/module/public/user/entity/user.entity';
import { Company } from 'src/module/public/company/entity/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company]), TenancyModule],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
