import { BaseResponse } from 'src/common/common.response';
import { Shift } from '../entity/shift.entity';

export class ShiftCashData extends BaseResponse {
  amount: number;
  comment?: string;
  shift: Shift;

  constructor(partial: Partial<ShiftCashData>) {
    super();
    Object.assign(this, partial);
  }
}
