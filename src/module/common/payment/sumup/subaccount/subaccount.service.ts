import { Injectable } from '@nestjs/common';
import { SumUpBaseService } from '../base/base.service';
import { SumUpSubAccount } from '../base/sumup.type';

@Injectable()
export class SubAccountService {
  readonly path = 'me';
  constructor(private readonly sumUpBaseService: SumUpBaseService) {}

  async lisSubAccounts(): Promise<SumUpSubAccount[]> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/accounts`,
    });
    return data;
  }

  async create({
    body,
  }: {
    body: {
      password: string;
      username: string;
    };
  }): Promise<SumUpSubAccount> {
    const { data } = await this.sumUpBaseService.post({
      path: `${this.path}/accounts`,
      data: body,
    });
    return data;
  }

  async update({
    body,
    operator_code,
  }: {
    operator_code: string;
    body: {
      password?: string;
      username?: string;
    };
  }): Promise<SumUpSubAccount> {
    const { data } = await this.sumUpBaseService.put({
      path: `${this.path}/accounts/${operator_code}`,
      data: body,
    });
    return data;
  }

  async deactivate({ operator_code }: { operator_code: string }): Promise<SumUpSubAccount> {
    const { data } = await this.sumUpBaseService.delete({
      path: `${this.path}/accounts/${operator_code}`,
    });
    return data;
  }
}
