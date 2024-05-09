import { Inject, Injectable } from '@nestjs/common';
import { ENV, TENANT_SCHEMA } from 'src/common/constant';
import { tenantedEntityMigration } from 'src/orm.config';
import { SnakeNamingStrategy } from 'src/snake-naming.strategy';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TenancyService {
  private _connectionManager: Map<string, DataSource>;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CompanyConfig) private readonly companyConfigRepository: Repository<CompanyConfig>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this._connectionManager = new Map<string, DataSource>();
  }

  async getTenantConnection(tenantId: string): Promise<DataSource> {
    const connectionName = `${TENANT_SCHEMA}${tenantId}`;

    if (this._connectionManager.has(connectionName)) {
      const connection = this._connectionManager.get(connectionName);
      if (!!connection && !connection.isInitialized) {
        await connection.initialize();
      }
      return connection;
      // return Promise.resolve(connection.isInitialized ? connection : await connection.initialize());
    }

    const options: DataSourceOptions = {
      type: 'postgres',
      host: this.configService.get().db.host,
      port: this.configService.get().db.port,
      username: this.configService.get().db.username,
      password: this.configService.get().db.password,
      database: this.configService.get().db.db_name,
      namingStrategy: new SnakeNamingStrategy(),
      logging: true,
      ssl: this.configService.get().env === ENV.prod && true,
      ...tenantedEntityMigration,
      name: connectionName,
      schema: connectionName,
    };

    const dataSource = await new DataSource(options).initialize();

    this._connectionManager.set(connectionName, dataSource);
    return dataSource;
  }

  async getCompanyConfig(tenantId: string) {
    const value = await this.cacheManager.get(`CompanyConfig-${tenantId}`);
    if (value) {
      return value;
    }

    const company_config = await this.companyConfigRepository.findOne({
      where: {
        company: {
          key: tenantId,
        },
      },
    });

    await this.cacheManager.set(`CompanyConfig-${tenantId}`, company_config, 600);
    return company_config;
  }
}
