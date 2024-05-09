import { BaseResponse } from 'src/common/common.response';
import { DiscountType } from 'src/common/enum';
import { Store } from '../../store/entity/store.entity';
import { Exclude } from 'class-transformer';

export class DiscountData extends BaseResponse {
  name: string;
  code: string;
  type: DiscountType;
  value: number;

  @Exclude()
  stores: Store[];
  constructor(partial: Partial<DiscountData>) {
    super();
    Object.assign(this, partial);
  }
}
