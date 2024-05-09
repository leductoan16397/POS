import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { SumUpBaseModule } from '../base/base.module';

@Module({
  controllers: [],
  exports: [MerchantService],
  imports: [SumUpBaseModule],
  providers: [MerchantService],
})
export class MerchantModule {}
