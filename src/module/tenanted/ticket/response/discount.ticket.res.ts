import { BaseResponse } from 'src/common/common.response';
import { DiscountType } from 'src/common/enum';

export class DiscountTicketData extends BaseResponse {
  discountId: string;
  discountName?: string;
  discountType: DiscountType;
  value: number;
  deletedAt?: Date;

  constructor(partial: Partial<DiscountTicketData>) {
    super();

    Object.assign(this, partial);
  }
}
