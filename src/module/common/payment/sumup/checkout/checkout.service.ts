import { Injectable } from '@nestjs/common';
import { SumUpBaseService } from '../base/base.service';
import { PersonalAddress, SumUpCheckout, SumUpCheckoutStatus, SumUpTransaction } from '../base/sumup.type';

@Injectable()
export class CheckoutService {
  readonly path = 'checkouts';
  constructor(private readonly sumUpBaseService: SumUpBaseService) {}

  async list({ checkout_reference }: { checkout_reference?: string }): Promise<SumUpCheckout[]> {
    const { data } = await this.sumUpBaseService.get({
      path: this.path,
      config: {
        params: {
          ...(checkout_reference && {
            checkout_reference,
          }),
        },
      },
    });
    return data;
  }

  async create({
    body,
  }: {
    body: {
      amount: number;
      checkout_reference: string;
      currency: string;
      merchant_code: string;
      customer_id?: string;
      date?: string;
      description?: string;
      id?: string;
      pay_to_email?: string;
      payment_type: string;
      personal_details?: {
        address?: Partial<PersonalAddress>;
        email?: string;
        first_name?: string;
        last_name?: string;
        tax_id?: string;
      };
      purpose?: 'CHECKOUT' | 'SETUP_RECURRING_PAYMENT';
      redirect_url?: string;
      return_url?: string;
      status?: SumUpCheckoutStatus;
      transactions?: SumUpTransaction[];
      valid_until?: string;
    };
  }): Promise<SumUpCheckout> {
    const { data } = await this.sumUpBaseService.post({
      path: this.path,
      data: body,
    });
    return data;
  }

  async retrieve({ id }: { id: string }): Promise<SumUpCheckout> {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/${id}`,
    });
    return data;
  }

  async process({ id }: { id: string }): Promise<SumUpCheckout> {
    const { data } = await this.sumUpBaseService.put({
      path: `${this.path}/${id}`,
    });
    return data;
  }

  async deactivate({ id }: { id: string }): Promise<SumUpCheckout> {
    const { data } = await this.sumUpBaseService.delete({
      path: `${this.path}/${id}`,
    });
    return data;
  }

  async getAvailablePaymentMethods({ merchant_code }: { merchant_code: string }): Promise<{
    available_payment_methods: {
      id: string;
    }[];
  }> {
    const { data } = await this.sumUpBaseService.get({
      path: `merchants/${merchant_code}/payment-methods`,
    });
    return data;
  }
}
