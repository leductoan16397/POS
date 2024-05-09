import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { ItemVariantOption } from '../../item/entity/item.variant.entity';
import { ItemTicketType } from '../utils/enum';
import { ItemTicketModifier } from './item.ticket.modifier.entity';
import { Ticket } from './ticket.entity';

@Entity('item_tickets')
export class ItemTicket extends AbstractEntity {
  @Column({ nullable: false })
  itemId: string;

  @Column({ nullable: false, type: 'enum', enum: ItemTicketType })
  itemType: ItemTicketType;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  discountedPrice: number;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  price: number;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: true })
  @Index()
  itemName?: string;

  @Column({ nullable: false, default: 0 })
  tax: number;

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  options?: ItemVariantOption;

  @Column({ default: 0 })
  refundedQuantity: number;

  @OneToMany(() => ItemTicketModifier, (modifier) => modifier.itemTicket, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  modifiers?: ItemTicketModifier[];

  @ManyToOne(() => Ticket, (ticket) => ticket.itemTickets, { nullable: true })
  ticket: Ticket;
}
