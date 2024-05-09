import { Module } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { SumUpBaseModule } from '../base/base.module';

@Module({
  controllers: [],
  exports: [PayoutService],
  imports: [SumUpBaseModule],
  providers: [PayoutService],
})
export class PayoutModule {}
