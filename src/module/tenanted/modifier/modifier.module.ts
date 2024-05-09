import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifierController } from './modifier.controller';
import { ModifierService } from './modifier.service';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), TenancyModule],
  providers: [ModifierService],
  controllers: [ModifierController],
})
export class ModifierModule {}
