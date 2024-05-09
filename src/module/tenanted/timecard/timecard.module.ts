import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimecardController } from './timecard.controller';
import { TimecardService } from './timecard.service';
import { User } from 'src/module/public/user/entity/user.entity';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TenancyModule],
  providers: [TimecardService],
  controllers: [TimecardController],
})
export class TimecardModule {}
