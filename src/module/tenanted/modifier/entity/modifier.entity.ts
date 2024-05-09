import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity, Index, JoinTable, ManyToMany } from 'typeorm';
import { Item } from '../../item/entity/item.entity';

export interface ModifierOption {
  name: string;
  price?: number;
  priority: number;
}

@Entity({ name: 'modifiers' })
export class Modifier extends AbstractEntity {
  @Column()
  @Index()
  name: string;

  @Column({ type: 'jsonb' })
  options: ModifierOption[];

  @ManyToMany(() => Item, (item) => item.modifiers, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  @JoinTable({
    name: 'item_modifier',
    joinColumn: {
      name: 'modifier_id',
    },
    inverseJoinColumn: {
      name: 'item_id',
    },
  })
  items?: Item[];
}
