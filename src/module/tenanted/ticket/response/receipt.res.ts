import { BaseResponse } from 'src/common/common.response';
import { Ticket } from '../entity/ticket.entity';
import { PaymentStatus, PaymentType } from '../utils/enum';

export class ReceiptData extends BaseResponse {
  totalPrice: number;
  totalAmount: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  email?: string;
  ticket: Ticket;

  constructor(partial: Partial<ReceiptData>) {
    super();

    Object.assign(this, partial);

    this.totalAmount = this.totalPrice;
  }
}
