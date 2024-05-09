import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';
import { Company } from 'src/module/public/company/entity/company.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { ShiftCash } from './entity/shift.cash.entity';
import { Shift } from './entity/shift.entity';
import { ShiftCashController } from './shift.cash.controller';
import { ShiftCashService } from './shift.cash.service';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { StoreModule } from '../store/store.module';
import { MailModule } from 'src/module/common/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift, ShiftCash, TenantUser, User, Company]),
    TenancyModule,
    StoreModule,
    MailModule,
  ],
  controllers: [ShiftController, ShiftCashController],
  providers: [ShiftService, ShiftCashService],
})
export class ShiftModule {}
