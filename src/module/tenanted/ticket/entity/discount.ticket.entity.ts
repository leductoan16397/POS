import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { DiscountType } from 'src/common/enum';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Discount } from '../../discount/entity/discount.entity';
import { Ticket } from './ticket.entity';

@Entity('discount_tickets')
export class DiscountTicket extends AbstractEntity {
  @Column({ nullable: false })
  discountType: DiscountType;

  @Column({ nullable: false })
  @Index()
  discountName: string;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  value: number;

  @Column({ nullable: true })
  @Index()
  code: string;

  @ManyToOne(() => Discount, (discount) => discount.discountTickets)
  discount: Discount;

  @ManyToOne(() => Ticket, (ticket) => ticket.discountTickets)
  ticket: Ticket;
}
