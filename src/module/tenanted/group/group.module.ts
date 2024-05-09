import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessGroup } from './entity/group.entity';
import { TenantUserGroupController } from './group.controller';
import { TenantUserGroupService } from './group.service';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccessGroup]), TenancyModule],
  providers: [TenantUserGroupService],
  controllers: [TenantUserGroupController],
})
export class TenantUserGroupModule {}
