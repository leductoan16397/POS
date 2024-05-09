import { Injectable } from '@nestjs/common';
import { SumUpBaseService } from '../base/base.service';
import { SumUpPayout } from '../base/sumup.type';

@Injectable()
export class PayoutService {
  readonly path = 'me';
  constructor(private readonly sumUpBaseService: SumUpBaseService) {}

  async listPayouts({
    end_date,
    start_date,
    format,
    limit,
    order,
  }: {
    start_date: string;
    end_date: string;
    format?: string;
    limit?: number;
    order?: string;
  }): Promise<SumUpPayout[]> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/financials/payouts`,
      config: {
        params: {
          end_date,
          start_date,
          format,
          limit,
          order,
        },
      },
    });
    return data;
  }
}
