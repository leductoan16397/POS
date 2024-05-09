import { Module } from '@nestjs/common';
import { SubAccountService } from './subaccount.service';
import { SumUpBaseModule } from '../base/base.module';

@Module({
  controllers: [],
  exports: [SubAccountService],
  imports: [SumUpBaseModule],
  providers: [SubAccountService],
})
export class SubAccountModule {}
