export enum ItemTicketType {
  Item = 'ITEM',
  ItemVariant = 'ITEM_VARIANT',
}

export enum TicketType {
  Order = 'ORDER',
  Refund = 'REFUND',
}

export enum OrderType {
  Dinein = 'DINE_IN',
  Takeout = 'TAKE_OUT',
  Delivery = 'DELIVERY',
}

export enum OrderTypeLabel {
  DINE_IN = 'Dine in',
  TAKE_OUT = 'Takeout',
  DELIVERY = 'Delivery',
}

export enum PaymentType {
  Cash = 'CASH',
  Card = 'CARD',
}

export enum PaymentStatus {
  Pending = 'PENDING',
  Waiting = 'WAITING',
  Completed = 'COMPLETED',
}
