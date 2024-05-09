import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer } from './entity/customer.entity';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), TenancyModule],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
