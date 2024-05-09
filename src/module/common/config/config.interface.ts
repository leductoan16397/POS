export interface ConfigDatabase {
  host: string;
  port: number;
  username: string;
  password: string;
  db_name: string;
}

export interface AuthConfig {
  token_expire_time: string;
  bcrypt_salt: string;
  access_token_secret: string;

  refresh_token_secret: string;
  refresh_token_expire_time: string;
}

export interface MailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface SumUpConfig {
  base_url: string;
  secret_key: string;
}

export interface ConfigData {
  port: number;
  env: string;
  body_limit: number;

  db: ConfigDatabase;
  auth: AuthConfig;

  mail: MailConfig;

  sumup: SumUpConfig;
}
