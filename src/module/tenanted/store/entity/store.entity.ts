import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, Index, ManyToMany, OneToMany } from 'typeorm';
import { Discount } from '../../discount/entity/discount.entity';
import { Timecard } from '../../timecard/entity/timecard.entity';

@Entity({ name: 'stores' })
export class Store extends AbstractEntity {
  @Column()
  @Index()
  name: string;

  @Column({})
  description: string;

  @Column({})
  phone: string;

  @Column({})
  address: string;

  @ManyToMany(() => Discount, (discount) => discount.stores, {
    cascade: true,
  })
  discounts: Discount[];

  @OneToMany(() => Timecard, (timecard) => timecard.store)
  timecards: Timecard[];
}
