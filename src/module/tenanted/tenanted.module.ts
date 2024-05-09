import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { CategoryModule } from './category/category.module';
import { CustomerModule } from './customer/customer.module';
import { DiscountModule } from './discount/discount.module';
import { TenantUserGroupModule } from './group/group.module';
import { ItemModule } from './item/item.module';
import { ModifierModule } from './modifier/modifier.module';
import { ShiftModule } from './shift/shift.module';
import { StoreModule } from './store/store.module';
import { TicketModule } from './ticket/ticket.module';
import { TimecardModule } from './timecard/timecard.module';
import { TenantUserModule } from './user/tenant.user.module';
import { TransactionHistoryModule } from './transaction/transaction.history.module';

const tenantPath = 'tenants';
@Module({
  imports: [
    DiscountModule,
    StoreModule,
    TenantUserModule,
    CategoryModule,
    CustomerModule,
    ItemModule,
    TenantUserGroupModule,
    ShiftModule,
    ModifierModule,
    TicketModule,
    TimecardModule,
    TransactionHistoryModule,
    RouterModule.register([
      {
        path: tenantPath,
        module: TransactionHistoryModule,
      },
      {
        path: tenantPath,
        module: StoreModule,
      },
      {
        path: tenantPath,
        module: TenantUserModule,
      },
      {
        path: tenantPath,
        module: CategoryModule,
      },
      {
        path: tenantPath,
        module: CustomerModule,
      },
      {
        path: tenantPath,
        module: ItemModule,
      },
      {
        path: tenantPath,
        module: DiscountModule,
      },
      {
        path: tenantPath,
        module: TenantUserGroupModule,
      },
      {
        path: tenantPath,
        module: ShiftModule,
      },
      {
        path: tenantPath,
        module: ModifierModule,
      },
      {
        path: tenantPath,
        module: TicketModule,
      },
      {
        path: tenantPath,
        module: TimecardModule,
      },
    ]),
  ],
  providers: [],
  controllers: [],
})
export class TenantedModule {}
