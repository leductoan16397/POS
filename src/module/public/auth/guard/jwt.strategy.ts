import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/module/common/config/config.service';
import { AuthService } from '../auth.service';
import { TokenPayload } from 'src/common/type';
import { Request } from 'express';

export const getToken = (req: Request) => {
  const token = req.headers.authorization?.replace('Bearer', '')?.replace('bearer', '')?.trim();
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: getToken,
      ignoreExpiration: false,
      secretOrKey: configService.get().auth.access_token_secret,
    });
  }

  async validate(payload: TokenPayload) {
    return this.authService.validateUser(payload);
  }
}
