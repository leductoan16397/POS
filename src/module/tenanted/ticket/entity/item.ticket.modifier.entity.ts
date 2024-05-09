import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { ItemTicket } from './item.ticket.entity';

@Entity('item_ticket_modifiers')
export class ItemTicketModifier extends AbstractEntity {
  @Column()
  @Index()
  modifierId: string;

  @Column()
  modifierName: string;

  @Column()
  optionName: string;

  @Column('double precision', { nullable: false, transformer: new DecimalColumnTransformer() })
  price: number;

  @ManyToOne(() => ItemTicket, (ticket) => ticket.modifiers, {
    onDelete: 'CASCADE',
  })
  itemTicket: ItemTicket;
}
