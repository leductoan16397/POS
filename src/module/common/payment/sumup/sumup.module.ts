import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction/transaction.module';
import { SubAccountModule } from './subaccount/subaccount.module';
import { ReceiptModule } from './receipt/receipt.module';
import { PayoutModule } from './payout/payout.module';
import { MerchantModule } from './merchant/merchant.module';
import { CustomerModule } from './customer/customer.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    TransactionModule,
    SubAccountModule,
    ReceiptModule,
    PayoutModule,
    MerchantModule,
    CustomerModule,
    CheckoutModule,
  ],
})
export class SumUpModule {}
