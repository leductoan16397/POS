import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
// import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DEFAULT_SCHEMA, ENV, TENANT_EX, TENANT_SCHEMA } from './common/constant';
import { LoggerMiddleware } from './common/midleware/logger';
import { ConfigModule } from './module/common/config/config.module';
import { ConfigService } from './module/common/config/config.service';
import { TenancyModule } from './module/common/tenancy/tenantcy.module';
import { TenancyService } from './module/common/tenancy/tenantcy.service';
import { RootModule } from './module/root.module';
import { publicEntityMigration } from './orm.config';
import { SnakeNamingStrategy } from './snake-naming.strategy';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TenancyModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
      serveStaticOptions: {
        index: false,
      },
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get().db.host,
          port: configService.get().db.port,
          username: configService.get().db.username,
          password: configService.get().db.password,
          database: configService.get().db.db_name,
          namingStrategy: new SnakeNamingStrategy(),
          logging: true,
          ssl: configService.get().env === ENV.prod && true,
          ...publicEntityMigration,
        };
      },
      dataSourceFactory: async (options: PostgresConnectionOptions) => {
        let dataSource = await new DataSource(options).initialize();

        const schemas: any[] = await dataSource.query(
          `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${DEFAULT_SCHEMA}';`,
        );

        if (schemas.length === 0) {
          await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${DEFAULT_SCHEMA}"`);
        }
        await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${TENANT_EX}"`);

        await dataSource.destroy();

        const newOptions: PostgresConnectionOptions = {
          ...options,
          schema: DEFAULT_SCHEMA,
          name: DEFAULT_SCHEMA,
        };

        dataSource = await new DataSource(newOptions).initialize();
        await dataSource.runMigrations();

        return dataSource;
      },
    }),
    RootModule,
    // I18nModule.forRoot({
    //   fallbackLanguage: 'en',
    //   fallbacks: {
    //     'en-*': 'en',
    //   },
    //   loaderOptions: {
    //     path: join(__dirname, '/i18n/'),
    //   },
    //   typesOutputPath: join(__dirname, '../src/generated/i18n.generated.ts'),
    //   resolvers: [{ use: HeaderResolver, options: ['lang'] }],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tenancyService: TenancyService,
  ) {}

  async onModuleInit() {
    const schemas = await this.dataSource.query('select schema_name as name from information_schema.schemata;');
    await Promise.all(
      schemas.map(async ({ name: schema }) => {
        if (schema.startsWith(TENANT_SCHEMA)) {
          const tenantId = schema.replace(TENANT_SCHEMA, '');
          const connection = await this.tenancyService.getTenantConnection(tenantId);
          await connection.runMigrations();
        }
      }),
    );
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  // async onModuleDestroy() {
  //   try {
  //     await this.dataSource.destroy();
  //   } catch (error) {
  //     console.log(
  //       `${new Date().toString()} 🚀 ~ file: app.module.ts:112 ~ AppModule ~ onModuleDestroy ~ error:`,
  //       error,
  //     );
  //   }
  // }
}
