import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ExceptionFilterHandler } from 'src/common/exception';
import { TenancyModule } from './common/tenancy/tenantcy.module';
import { TenantedModule } from './tenanted/tenanted.module';
import { PublicModule } from './public/public.module';
import { CommonModule } from './common/comon.module';

@Module({
  imports: [TenancyModule, PublicModule, TenantedModule, CommonModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilterHandler,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class RootModule {}
