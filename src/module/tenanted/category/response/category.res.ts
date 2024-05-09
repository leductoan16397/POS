import { Exclude } from 'class-transformer';
import { BaseResponse } from 'src/common/common.response';

export class CategoryData extends BaseResponse {
  name: string;
  color: string;
  totalItem: number;
  tax: number;

  @Exclude()
  createdBy: any;

  constructor(partial: Partial<CategoryData>) {
    super();
    Object.assign(this, partial);
  }
}
