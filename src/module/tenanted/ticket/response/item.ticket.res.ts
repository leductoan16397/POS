import { BaseResponse } from 'src/common/common.response';
import { ItemVariantOption } from '../../item/entity/item.variant.entity';
import { ItemTicketModifier } from '../entity/item.ticket.modifier.entity';
import { ItemTicketType } from '../utils/enum';
import { generateVariantName } from '../utils/helper';

export class ItemTicketData extends BaseResponse {
  itemId: string;
  itemName?: string;
  variantName?: string;
  itemType: ItemTicketType;
  price: number;
  discountedPrice: number;
  amount?: number;
  quantity: number;
  refundQuantity?: number;
  options?: ItemVariantOption;
  deletedAt?: Date;
  refunded?: boolean;
  modifiers?: ItemTicketModifier[];

  constructor(partial: Partial<ItemTicketData>) {
    super();

    Object.assign(this, partial);

    this.amount = this.price;
    this.variantName = this.options ? generateVariantName(this.options) : '';
    this.refunded = partial.refunded ?? false;
  }
}
