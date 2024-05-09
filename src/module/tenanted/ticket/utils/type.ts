import { ItemTicket } from '../entity/item.ticket.entity';

export type RefundItemTicketInfo = {
  totalRefundPrice: number;
  totalRefundOriginal: number;
  totalRefundDiscount: number;
  totalTaxAmount: number;
  refundedItemTickets: ItemTicket[];
};
