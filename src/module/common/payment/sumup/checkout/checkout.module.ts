import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { SumUpBaseModule } from '../base/base.module';

@Module({
  controllers: [],
  exports: [CheckoutService],
  imports: [SumUpBaseModule],
  providers: [CheckoutService],
})
export class CheckoutModule {}
