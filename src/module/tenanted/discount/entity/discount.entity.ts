import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, DeleteDateColumn, Entity, Index, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { DiscountType } from '../../../../common/enum';
import { Store } from '../../store/entity/store.entity';
import { DiscountTicket } from '../../ticket/entity/discount.ticket.entity';

@Entity({ name: 'discounts' })
export class Discount extends AbstractEntity {
  @Column()
  @Index()
  name: string;

  @Column({})
  @Index()
  code: string;

  @Column({})
  value: number;

  @Column({ enum: DiscountType })
  type: DiscountType;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => Store, (store) => store.discounts, {
    eager: true,
  })
  @JoinTable({
    name: 'discount_store',
    joinColumn: {
      name: 'discount_id',
    },
    inverseJoinColumn: {
      name: 'store_id',
    },
  })
  stores: Store[];

  @OneToMany(() => DiscountTicket, (discountTicket) => discountTicket.discount)
  discountTickets: DiscountTicket[];
}
