import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from './module/common/config/config.service';
import { SnakeNamingStrategy } from './snake-naming.strategy';
import { tenantedEntityMigration } from './orm.config';
import { TENANT_EX } from './common/constant';

config();

const configService = new ConfigService();
configService.loadFromEnv();

export default new DataSource({
  type: 'postgres',
  host: configService.get().db.host,
  port: configService.get().db.port,
  username: configService.get().db.username,
  password: configService.get().db.password,
  database: configService.get().db.db_name,
  namingStrategy: new SnakeNamingStrategy(),
  ...tenantedEntityMigration,
  schema: TENANT_EX,
});
