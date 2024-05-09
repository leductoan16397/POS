import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { Discount } from './entity/discount.entity';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';
@Module({
  imports: [TypeOrmModule.forFeature([Discount]), TenancyModule],
  providers: [DiscountService],
  controllers: [DiscountController],
  exports: [DiscountService],
})
export class DiscountModule {}
