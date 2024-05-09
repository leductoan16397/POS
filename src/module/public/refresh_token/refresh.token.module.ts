import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entity/refresh.token.entity';
import { RefreshTokenService } from './refresh.token.service';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  providers: [RefreshTokenService],
  controllers: [],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
