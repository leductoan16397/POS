import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entity/category.entity';
import { TenantUser } from '../user/entity/tenant.user.entity';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [TypeOrmModule.forFeature([TenantUser, Category]), TenancyModule],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
