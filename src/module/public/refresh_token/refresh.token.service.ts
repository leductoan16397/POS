import { Injectable } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entity/refresh.token.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(@InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>) {}

  async storeToken({ token, user }: { user: User; token: string }) {
    const refreshToken = new RefreshToken();
    refreshToken.token = token;
    refreshToken.user = user;
    return this.refreshTokenRepository.save(refreshToken);
  }

  async findOne(options: FindOneOptions<RefreshToken>) {
    return this.refreshTokenRepository.findOne(options);
  }

  async find(options: FindOneOptions<RefreshToken>) {
    return this.refreshTokenRepository.find(options);
  }
}
