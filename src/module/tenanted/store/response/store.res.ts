import { Exclude } from 'class-transformer';
import { BaseResponse } from 'src/common/common.response';
import { Timecard } from '../../timecard/entity/timecard.entity';

export class StoreData extends BaseResponse {
  name: string;
  description: string;
  phone: string;
  address: string;

  @Exclude()
  discounts: any[];

  @Exclude()
  timecards: Timecard[];

  constructor(partial: Partial<StoreData>) {
    super();
    Object.assign(this, partial);
  }
}
