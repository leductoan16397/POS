import { Exclude, Type } from 'class-transformer';
import { BaseResponse } from 'src/common/common.response';
import { User } from '../../user/entity/user.entity';
import { CompanyConfigData } from '../../company_config/response/company.config.res';

export class CompanyData extends BaseResponse {
  businessName: string;
  key: string;
  ownerEmail: string;

  @Exclude()
  createdBy: User;

  @Type(() => CompanyConfigData)
  config: CompanyConfigData;

  constructor(partial: Partial<CompanyData>) {
    super();
    Object.assign(this, partial);
  }
}
