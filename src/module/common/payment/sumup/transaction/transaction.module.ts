import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { SumUpBaseModule } from '../base/base.module';

@Module({
  controllers: [],
  exports: [TransactionService],
  imports: [SumUpBaseModule],
  providers: [TransactionService],
})
export class TransactionModule {}
