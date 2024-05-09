import { BaseResponse } from 'src/common/common.response';

export class TransactionHistoryData extends BaseResponse {
  constructor(partial: Partial<TransactionHistoryData>) {
    super();
    Object.assign(this, partial);
  }
}
