import { BaseResponse } from 'src/common/common.response';
import { Modifier } from '../../modifier/entity/modifier.entity';
import { ShowType, SoldType } from '../entity/item.entity';

export class ItemData extends BaseResponse {
  name: string;
  soldBy: SoldType;
  description?: string;
  options: string[];
  showType: ShowType;
  image?: string;
  color?: string;
  icon?: string;
  stock: number;
  tax: number;
  trackStock: boolean;
  categories?: string[];
  modifiers?: Modifier[];

  constructor(partial: Partial<ItemData>) {
    super();
    Object.assign(this, partial);
  }
}
