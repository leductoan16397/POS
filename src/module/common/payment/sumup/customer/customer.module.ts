import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { SumUpBaseModule } from '../base/base.module';

@Module({
  controllers: [],
  exports: [CustomerService],
  imports: [SumUpBaseModule],
  providers: [CustomerService],
})
export class CustomerModule {}
