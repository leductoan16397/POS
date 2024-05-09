import { DEFAULT_SCHEMA } from 'src/common/constant';
import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Company } from '../../company/entity/company.entity';
import { User } from '../../user/entity/user.entity';
import { CountryCode } from 'countries-and-timezones';

@Entity({ name: 'company_configs', schema: DEFAULT_SCHEMA })
export class CompanyConfig extends AbstractEntity {
  @Column({ nullable: true })
  countryId?: CountryCode;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  currencyCode?: string;

  @Column({ nullable: true })
  currencySymbol?: string;

  @Column({ nullable: true })
  minorUnit?: number;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ nullable: true })
  transactionPct?: string;

  @Column({ nullable: true })
  affiliateKey?: string;

  @Column({ nullable: true })
  publicKey?: string;

  @Column({ nullable: true })
  privateKey?: string;

  @Column({ default: 'yyyy-MM-dd' })
  dateFormat?: string;

  @Column({ default: ',' })
  separator?: string;

  @Column({ default: '.' })
  decimalSymbol?: string;

  @Column({ default: 'HH:mm' })
  timeFormat?: string;

  @Column({ default: 'en' })
  language?: string;

  @Column({ default: 'Dr' })
  nameFormat?: string;

  @Column({ default: true })
  currencySymbolOnLeft?: boolean;

  @Column({ default: null })
  taxCode?: string;

  @Column({ default: 2 })
  decimalPlaces?: number;

  @OneToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @OneToOne(() => Company, (user) => user.config)
  company: Company;
}
