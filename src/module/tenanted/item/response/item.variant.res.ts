import { BaseResponse } from 'src/common/common.response';
import { ItemVariantOption, ItemVariantStore } from '../entity/item.variant.entity';

export class ItemVariantData extends BaseResponse {
  price?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  options: ItemVariantOption;
  stores: ItemVariantStore[];

  constructor(partial: Partial<ItemVariantData>) {
    super();
    Object.assign(this, partial);
  }
}

export class NextSkuData {
  sku: string;

  constructor(partial: Partial<NextSkuData>) {
    Object.assign(this, partial);
  }
}
