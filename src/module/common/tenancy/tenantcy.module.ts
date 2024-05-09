import { ForbiddenException, Module, Provider, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { COMPANY_CONFIG, CONNECTION } from './tenantcy.symbol';
import { TenancyService } from './tenantcy.service';
import { ConfigModule } from '../config/config.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getToken } from 'src/module/public/auth/guard/jwt.strategy';
import { TokenPayload } from 'src/common/type';
import { ConfigService } from '../config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';

const connectionFactory: Provider = {
  provide: CONNECTION,
  scope: Scope.REQUEST,
  useFactory: async (request: Request, tenancyService: TenancyService, jwtService: JwtService) => {
    try {
      const token = getToken(request);
      const payload = await jwtService.verifyAsync<TokenPayload>(token, {});

      if (!payload.tenantId) {
        throw new ForbiddenException();
      }

      const dataSource = await tenancyService.getTenantConnection(payload.tenantId);
      return dataSource;
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: tenantcy.module.ts:27 ~ useFactory: ~ error:`, error);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token Expired');
      }
      throw error;
    }
  },
  inject: [REQUEST, TenancyService, JwtService],
};

const companyConfig: Provider = {
  provide: COMPANY_CONFIG,
  scope: Scope.REQUEST,
  useFactory: async (request: Request, tenancyService: TenancyService, jwtService: JwtService) => {
    try {
      const now = Date.now();

      const token = getToken(request);
      const payload = await jwtService.verifyAsync<TokenPayload>(token, {});

      if (!payload.tenantId) {
        throw new ForbiddenException();
      }

      const companyConfigData = await tenancyService.getCompanyConfig(payload.tenantId);
      console.log(`...............After......COMPANY_CONFIG................................ ${Date.now() - now}ms`);

      return companyConfigData;
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: tenantcy.module.ts:56 ~ useFactory: ~ error:`, error);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token Expired');
      }
      throw error;
    }
  },
  inject: [REQUEST, TenancyService, JwtService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyConfig]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get().auth.access_token_secret,
          signOptions: { expiresIn: configService.get().auth.token_expire_time },
        };
      },
    }),
  ],
  providers: [connectionFactory, TenancyService, companyConfig],
  exports: [CONNECTION, TenancyService, COMPANY_CONFIG],
})
export class TenancyModule {}
