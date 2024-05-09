import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, DeleteDateColumn, Entity, ManyToOne } from 'typeorm';
import { Item } from './item.entity';

export interface ItemVariantOption {
  [key: string]: string;
}

export interface ItemVariantStore {
  storeId: string;
  isAvailable: boolean;
  price?: number;
}

@Entity({ name: 'item_variants' })
export class ItemVariant extends AbstractEntity {
  @Column('double precision', { nullable: true, transformer: new DecimalColumnTransformer() })
  price?: number;

  @Column('double precision', { nullable: true, transformer: new DecimalColumnTransformer() })
  cost?: number;

  @Column({ readonly: true })
  sku_id: number;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  inStock: number;

  @Column({ nullable: true })
  lowStock: number;

  @Column({ nullable: true })
  optimalStock: number;

  @Column({ nullable: true })
  barcode?: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({
    type: 'jsonb',
  })
  options: ItemVariantOption;

  @Column({
    type: 'jsonb',
  })
  stores: ItemVariantStore[];

  @ManyToOne(() => Item, (item) => item.variants, { nullable: false })
  item: Item;
}
