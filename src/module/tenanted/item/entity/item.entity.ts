import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { DecimalColumnTransformer } from 'src/common/entity/transformer';
import { Column, DeleteDateColumn, Entity, Index, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Category } from '../../category/entity/category.entity';
import { Modifier } from '../../modifier/entity/modifier.entity';
import { ItemVariant } from './item.variant.entity';

export enum SoldType {
  Each = 'EACH',
  Volume = 'VOLUME',
}

export interface ItemOption {
  name: string;
  value: string[];
}

export enum ShowType {
  Image = 'IMAGE',
  ColorAndIcon = 'COLOR_ICON',
}

@Entity({ name: 'items' })
export class Item extends AbstractEntity {
  @Column()
  @Index()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SoldType,
  })
  soldBy: SoldType;

  @Column({ default: ShowType.ColorAndIcon })
  showType: ShowType;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  icon?: string;

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

  @Column({ default: false })
  trackStock: boolean;

  @Column({ nullable: true })
  optimalStock: number;

  @Column({ nullable: true })
  barcode?: string;

  @Column('varchar', { array: true })
  options: string[];

  @DeleteDateColumn()
  deletedAt: Date;

  // @ManyToOne(() => Category, (category) => category.items, { nullable: true })
  // category?: Category;

  @ManyToMany(() => Category, (category) => category.items, {
    eager: true,
    cascade: true,
  })
  @JoinTable({
    name: 'item_category',
    joinColumn: {
      name: 'item_id',
    },
    inverseJoinColumn: {
      name: 'category_id',
    },
  })
  categories?: Category[];

  @OneToMany(() => ItemVariant, (variant) => variant.item, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  variants?: ItemVariant[];

  @ManyToMany(() => Modifier, (modifier) => modifier.items, { nullable: true })
  modifiers?: Modifier[];
}
