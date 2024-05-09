import { join } from 'path';

export const publicEntityMigration = {
  entities: [join(__dirname, './module/public/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migration/public/*{.ts,.js}')],
};

export const tenantedEntityMigration = {
  entities: [join(__dirname, './module/tenanted/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migration/tenanted/*{.ts,.js}')],
};
