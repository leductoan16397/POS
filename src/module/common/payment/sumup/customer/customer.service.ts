import { Injectable } from '@nestjs/common';
import { SumUpBaseService } from '../base/base.service';
import { SumUpPaymentInstrument, SumUpCustomer, PersonalDetail, SumUpCard } from '../base/sumup.type';

@Injectable()
export class CustomerService {
  readonly path = 'customers';
  constructor(private readonly sumUpBaseService: SumUpBaseService) {}

  async create({
    customer_id,
    personal_details,
  }: {
    personal_details: PersonalDetail;
    customer_id: string;
  }): Promise<SumUpCustomer> {
    const { data } = await this.sumUpBaseService.post({
      path: this.path,
      data: {
        customer_id,
        personal_details,
      },
    });
    return data;
  }

  async update({
    customer_id: id,
    personal_details,
  }: {
    customer_id: string;
    personal_details: Partial<PersonalDetail>;
  }): Promise<SumUpCustomer> {
    const { data } = await this.sumUpBaseService.put({
      path: `${this.path}/${id}`,
      data: {
        personal_details,
      },
    });
    return data;
  }

  async retrieve({ customer_id: id }: { customer_id: string }): Promise<SumUpCustomer> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/${id}`,
    });
    return data;
  }

  async listPaymentInstruments({ customer_id: id }: { customer_id: string }): Promise<SumUpPaymentInstrument[]> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/${id}/payment-instruments`,
    });
    return data;
  }

  async createPaymentInstruments({
    customer_id: id,
    body,
  }: {
    customer_id: string;
    body: {
      active: boolean;
      token: string;
      type: string;
      card: SumUpCard;
    };
  }): Promise<SumUpPaymentInstrument> {
    const { data } = await this.sumUpBaseService.post({
      path: `${this.path}/${id}/payment-instruments`,
      data: {
        body,
      },
    });
    return data;
  }

  async deactivatePaymentInstruments({ customer_id: id, token }: { customer_id: string; token: string }) {
    const { data } = await this.sumUpBaseService.delete({
      path: `${this.path}/${id}/payment-instruments/${token}`,
    });
    return data;
  }
}
