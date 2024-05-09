import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { SkuController } from './sku.controller';
import { SkuService } from './sku.service';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), TenancyModule],
  providers: [ItemService, SkuService],
  controllers: [ItemController, SkuController],
})
export class ItemModule {}
