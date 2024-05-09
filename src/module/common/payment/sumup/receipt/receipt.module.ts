import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { SumUpBaseModule } from '../base/base.module';

@Module({
  controllers: [],
  exports: [ReceiptService],
  imports: [SumUpBaseModule],
  providers: [ReceiptService],
})
export class ReceiptModule {}
