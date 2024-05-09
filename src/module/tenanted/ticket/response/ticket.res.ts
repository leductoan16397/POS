import { BaseResponse } from 'src/common/common.response';
import { Customer } from '../../customer/entity/customer.entity';
import { Shift } from '../../shift/entity/shift.entity';
import { PaymentStatus, TicketType } from '../utils/enum';
import { DiscountTicketData } from './discount.ticket.res';
import { ItemTicketData } from './item.ticket.res';

export class TicketData extends BaseResponse {
  name?: string;
  comment?: string;
  ticketType: TicketType;
  totalPrice: number;
  totalPriceOriginal: number;
  totalTaxAmount: number;
  totalAmount?: number;
  totalDiscount: number;
  ticketNumber: number;
  ticketNumberLabel?: string;
  customer?: Customer;
  shift?: Shift;
  itemTickets?: ItemTicketData[];
  discountTickets?: DiscountTicketData[];
  refundedTicketId?: string;
  totalCash: number;
  differentAmount: number;
  refunded?: boolean;
  taxList?: { name: string; amount: number }[];
  paymentStatus: PaymentStatus;

  constructor(partial: Partial<TicketData>) {
    super();

    Object.assign(this, partial);

    this.ticketNumberLabel = this.ticketNumber.toString().padStart(4, '0');
    this.totalPrice = this.paymentStatus === PaymentStatus.Completed && this.totalPrice < 0 ? 0 : this.totalPrice;
    this.totalAmount = this.totalPrice;

    this.totalCash = partial.totalCash ?? 0;
    this.differentAmount = partial.differentAmount ?? 0;
  }
}
