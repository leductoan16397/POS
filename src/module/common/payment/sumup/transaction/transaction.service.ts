import { Injectable } from '@nestjs/common';
import { SumUpBaseService } from '../base/base.service';
import { SumUpTransaction } from '../base/sumup.type';

@Injectable()
export class TransactionService {
  readonly path = 'me';
  constructor(private readonly sumUpBaseService: SumUpBaseService) {}

  async listFinancialTransactions({
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
  }): Promise<
    {
      amount: number;
      currency: string;
      external_reference: string;
      id: number;
      timestamp: string;
      transaction_code: string;
      type: string;
    }[]
  > {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/financials/transactions`,
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

  async refundTransaction({ txn_id }: { txn_id: any }) {
    const { data } = await this.sumUpBaseService.post({
      path: `${this.path}/refund/${txn_id}`,
    });
    return data;
  }

  async retrieveTransaction({
    id,
    internal_id,
    transaction_code,
  }: {
    id?: string;
    internal_id?: string;
    transaction_code?: string;
  }): Promise<SumUpTransaction> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/transactions`,
      config: {
        params: {
          id,
          internal_id,
          transaction_code,
        },
      },
    });
    return data;
  }

  async listTransactions({
    changes_since,
    limit,
    newest_ref,
    newest_time,
    oldest_ref,
    oldest_time,
    order,
    payment_types,
    statuses,
    types,
    users,
    transaction_code,
  }: {
    order?: string;
    limit?: number;
    transaction_code?: string;
    changes_since?: string;
    newest_time?: string;
    newest_ref?: string;
    oldest_time?: string;
    oldest_ref?: string;
    users?: string[];
    statuses?: string[];
    payment_types?: string[];
    types?: string[];
  }): Promise<{
    items: [
      {
        amount: number;
        currency: string;
        id: string;
        installments_count: number;
        payment_type: string;
        status: string;
        timestamp: string;
        transaction_code: string;
        payout_plan: string;
        payouts_received: string;
        payouts_total: string;
        product_summary: string;
        card_type: string;
        transaction_id: string;
        type: string;
        user: string;
      },
    ];
    links: [
      {
        href: null;
        rel: null;
        type: null;
      },
    ];
  }> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/transactions/history`,
      config: {
        params: {
          changes_since,
          limit,
          newest_ref,
          newest_time,
          oldest_ref,
          oldest_time,
          order,
          payment_types,
          statuses,
          types,
          users,
          transaction_code,
        },
      },
    });
    return data;
  }
}
