import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SumUpBaseService } from './base.service';
import { ConfigModule } from 'src/module/common/config/config.module';
import { ConfigService } from 'src/module/common/config/config.service';

@Module({
  controllers: [],
  exports: [SumUpBaseService],
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get().sumup.base_url,
        headers: {
          Authorization: 'Bearer ' + configService.get().sumup.secret_key,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SumUpBaseService],
})
export class SumUpBaseModule {}
