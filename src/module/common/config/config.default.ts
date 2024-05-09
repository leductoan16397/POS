import { ConfigData } from './config.interface';

export const DEFAULT_CONFIG: ConfigData = {
  port: 4444,
  env: 'dev',
  db: {
    db_name: 'pos',
    password: 'postgres',
    username: 'postgres',
    host: '127.0.0.1',
    port: 5432,
  },
  auth: {
    access_token_secret: '',
    refresh_token_secret: '',
    bcrypt_salt: '',
    refresh_token_expire_time: '15d',
    token_expire_time: '15m',
  },
  body_limit: Number(52428800),
  mail: {
    host: 'smtp.gmail.com',
    port: 485,
    username: '',
    password: '',
  },
  sumup: {
    base_url: '',
    secret_key: '',
  },
};
