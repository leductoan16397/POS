import { Exclude } from 'class-transformer';
import { BaseResponse } from 'src/common/common.response';
import { Company } from '../../company/entity/company.entity';
import { User } from '../../user/entity/user.entity';

export class CompanyConfigData extends BaseResponse {
  countryId?: string;
  currency?: string;
  currencyCode?: string;
  currencySymbol?: string;
  minorUnit?: number;
  timezone?: string;
  transactionPct?: string;
  dateFormat?: string;
  separator?: string;
  timeFormat?: string;
  language?: string;
  currencySymbolOnLeft?: boolean;
  state?: string;
  city?: string;
  zipCode?: string;
  address?: string;
  businessName?: string;
  taxCode?: string;
  decimalPlaces?: number;

  @Exclude()
  affiliateKey: string;

  @Exclude()
  publicKey: string;

  @Exclude()
  privateKey: string;

  @Exclude()
  createdBy: User;

  @Exclude()
  company: Company;

  constructor(partial: Partial<CompanyConfigData>) {
    super();
    Object.assign(this, partial);
  }
}
