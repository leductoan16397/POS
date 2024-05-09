import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Customer } from '../../customer/entity/customer.entity';
import { Shift } from '../../shift/entity/shift.entity';
import { TenantUser } from '../../user/entity/tenant.user.entity';
import { OrderType, PaymentStatus, TicketType } from '../utils/enum';
import { DiscountTicket } from './discount.ticket.entity';
import { ItemTicket } from './item.ticket.entity';
import { Receipt } from './receipt.entity';

@Entity('tickets')
export class Ticket extends AbstractEntity {
  @Column({ nullable: true })
  @Index()
  name?: string;

  @Column({ nullable: true })
  comment?: string;

  @Column({ nullable: false, type: 'enum', enum: TicketType, default: TicketType.Order })
  ticketType: TicketType;

  @Column({ nullable: false, type: 'enum', enum: OrderType })
  type: OrderType;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalPrice: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalPriceOriginal: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer(), default: 0 })
  totalTaxAmount: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  totalDiscount: number;

  @Column({ readonly: true })
  ticketNumber: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.Waiting })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  @Index()
  email: string;

  @OneToOne(() => Ticket, { nullable: true })
  @JoinColumn()
  refundedTicket: Ticket;

  @ManyToOne(() => TenantUser, (user) => user.tickets, { nullable: false })
  user: TenantUser;

  @ManyToOne(() => Customer, (customer) => customer.tickets, { nullable: true, cascade: true })
  customer?: Customer;

  @OneToMany(() => Receipt, (receipt) => receipt.ticket, { cascade: true })
  receipts: Receipt[];

  @ManyToOne(() => Shift, (shift) => shift.tickets, { nullable: true, cascade: true })
  shift?: Shift;

  @OneToMany(() => ItemTicket, (itemTicket) => itemTicket.ticket, { cascade: true })
  itemTickets: ItemTicket[];

  @OneToMany(() => DiscountTicket, (discount) => discount.ticket, { cascade: true })
  discountTickets: DiscountTicket[];
}
