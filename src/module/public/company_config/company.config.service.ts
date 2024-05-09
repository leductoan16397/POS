import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { LoggedUser } from 'src/common/type';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../company/entity/company.entity';
import { User } from '../user/entity/user.entity';
import { UpdateCompanyConfigDto } from './dto/company.config.dto';
import { CompanyConfig } from './entity/company.config.entity';
import { CompanyConfigPaymentData } from './response/company.config.payment.res';
import { CompanyConfigData } from './response/company.config.res';

@Injectable()
export class CompanyConfigService {
  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyConfig) private readonly companyConfigRepository: Repository<CompanyConfig>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectDataSource() private readonly connection: DataSource,
  ) {}

  async findOne({ loggedUser }: { loggedUser: LoggedUser }) {
    const user = await this.userRepository.findOne({
      where: { id: loggedUser.id },
    });

    const companyConfig = await this.companyConfigRepository.findOne({
      where: {
        company: {
          id: user.companyId,
        },
      },
      relations: {
        company: true,
      },
    });

    return new CompanyConfigData({ ...companyConfig, businessName: companyConfig.company.businessName });
  }

  async findPayment({ loggedUser }: { loggedUser: LoggedUser }) {
    const user = await this.userRepository.findOne({
      where: { id: loggedUser.id },
    });

    const companyConfig = await this.companyConfigRepository.findOne({
      where: {
        company: {
          id: user.companyId,
        },
      },
      select: { id: true, affiliateKey: true, publicKey: true, privateKey: true },
    });

    return new CompanyConfigPaymentData(companyConfig);
  }

  async update({ loggedUser, updateInput }: { loggedUser: LoggedUser; updateInput: UpdateCompanyConfigDto }) {
    const user = await this.userRepository.findOne({
      where: { id: loggedUser.id },
    });

    const companyConfig = await this.companyConfigRepository.findOne({
      where: {
        company: {
          id: user.companyId,
        },
      },
      relations: {
        company: true,
      },
    });

    const {
      address,
      businessName,
      city,
      countryId,
      currency,
      currencyCode,
      currencySymbol,
      currencySymbolOnLeft,
      dateFormat,
      decimalSymbol,
      language,
      minorUnit,
      nameFormat,
      separator,
      state,
      timeFormat,
      timezone,
      transactionPct,
      zipCode,
      affiliateKey,
      publicKey,
      privateKey,
      taxCode,
      decimalPlaces,
    } = updateInput;

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    const companyRepository = queryRunner.manager.getRepository(Company);
    const companyConfigRepository = queryRunner.manager.getRepository(CompanyConfig);

    try {
      if (businessName) {
        await companyRepository.save({
          id: companyConfig.company.id,
          businessName,
        });
      }

      await companyConfigRepository.update(
        {
          id: companyConfig.id,
        },
        {
          address,
          city,
          countryId,
          currency,
          currencyCode,
          currencySymbol,
          currencySymbolOnLeft,
          dateFormat,
          decimalSymbol,
          language,
          minorUnit,
          nameFormat,
          separator,
          state,
          timeFormat,
          timezone,
          transactionPct,
          zipCode,
          affiliateKey,
          publicKey,
          privateKey,
          taxCode,
          decimalPlaces,
        },
      );

      const newCompanyConfig = await companyConfigRepository.findOne({
        where: {
          id: companyConfig.id,
        },
        relations: {
          company: true,
        },
      });
      await queryRunner.commitTransaction();

      return new CompanyConfigData({ ...newCompanyConfig, businessName: newCompanyConfig.company.businessName });
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
