import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, DeleteDateColumn, Entity, Index, ManyToMany } from 'typeorm';
import { Item } from '../../item/entity/item.entity';

@Entity({ name: 'categories' })
export class Category extends AbstractEntity {
  @Column()
  @Index()
  name: string;

  @Column()
  color: string;

  @Column({ type: 'decimal', default: 0, transformer: new DecimalColumnTransformer() })
  tax: number;

  @Column()
  createdBy: string;

  @ManyToMany(() => Item, (item) => item.categories, { nullable: true })
  items: Item[];

  @DeleteDateColumn()
  deletedAt: Date;
}
