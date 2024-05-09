import { Injectable } from '@nestjs/common';
import { SumUpBaseService } from '../base/base.service';
import {
  SumUpBankAccount,
  SumUpBusiness,
  SumUpMerchantAccount,
  SumUpMerchantProfile,
  SumUpPersonalProfile,
  SumUpSetting,
} from '../base/sumup.type';

@Injectable()
export class MerchantService {
  readonly path = 'me';

  constructor(private readonly sumUpBaseService: SumUpBaseService) {}

  async retrieveProfile({ include }: { include?: string[] }): Promise<SumUpMerchantAccount> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}`,
      config: {
        params: {
          include,
        },
      },
    });
    return data;
  }

  async retrievePersonalProfile(): Promise<SumUpPersonalProfile> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/personal-profile`,
    });
    return data;
  }

  async retrieveMerchantProfile(): Promise<SumUpMerchantProfile> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/merchant-profile`,
    });
    return data;
  }

  async retrieveDBA(): Promise<SumUpBusiness> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/merchant-profile/doing-business-as`,
    });
    return data;
  }

  async getSettings(): Promise<SumUpSetting> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/merchant-profile/settings`,
    });
    return data;
  }

  async listBankAccounts({ primary }: { primary?: boolean }): Promise<SumUpBankAccount[]> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/merchant-profile/bank-accounts`,
      config: {
        params: {
          primary,
        },
      },
    });
    return data;
  }
}
