import { Injectable } from '@nestjs/common';
import { ConfigData } from './config.interface';
import { DEFAULT_CONFIG } from './config.default';

@Injectable()
export class ConfigService {
  private config: ConfigData;
  constructor() {
    this.config = DEFAULT_CONFIG;
  }

  public loadFromEnv() {
    this.config = this.parseConfigFromEnv(process.env);
  }

  private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
    return {
      port: (env.PORT && Number(env.PORT)) || DEFAULT_CONFIG.port,
      env: env.NODE_ENV || DEFAULT_CONFIG.env,
      db: {
        host: env.DB_HOST || DEFAULT_CONFIG.db.host,
        port: (env.DB_PORT && Number(env.DB_PORT)) || DEFAULT_CONFIG.db.port,
        db_name: env.DB_NAME || DEFAULT_CONFIG.db.db_name,
        password: env.DB_PASSWORD || DEFAULT_CONFIG.db.password,
        username: env.DB_USERNAME || DEFAULT_CONFIG.db.username,
      },
      auth: {
        access_token_secret: env.SECRET_KEY || DEFAULT_CONFIG.auth.access_token_secret,
        refresh_token_secret: env.REFRESH_SECRET_KEY || DEFAULT_CONFIG.auth.refresh_token_secret,
        bcrypt_salt: env.BCRYPT_SALT || DEFAULT_CONFIG.auth.bcrypt_salt,
        refresh_token_expire_time: env.REFRESH_TOKEN_EXPIRE_TIME || DEFAULT_CONFIG.auth.refresh_token_expire_time,
        token_expire_time: env.TOKEN_EXPIRE_TIME || DEFAULT_CONFIG.auth.token_expire_time,
      },
      body_limit: (env.BODY_LIMIT && Number(env.BODY_LIMIT)) || DEFAULT_CONFIG.body_limit,
      mail: {
        host: env.MAIL_HOST || DEFAULT_CONFIG.mail.host,
        port: (env.MAIL_PORT && Number(env.MAIL_PORT)) || DEFAULT_CONFIG.mail.port,
        username: env.MAIL_USERNAME || DEFAULT_CONFIG.mail.username,
        password: env.MAIL_PASSWORD || DEFAULT_CONFIG.mail.password,
      },
      sumup: {
        base_url: env.SUMUP_URL || DEFAULT_CONFIG.sumup.base_url,
        secret_key: env.SUMUP_SECRET_KEY || DEFAULT_CONFIG.sumup.secret_key,
      },
    };
  }

  public get(): Readonly<ConfigData> {
    return this.config;
  }
}
