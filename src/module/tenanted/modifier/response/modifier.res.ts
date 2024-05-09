import { BaseResponse } from 'src/common/common.response';
import { ModifierOption } from '../entity/modifier.entity';

export class ModifierData extends BaseResponse {
  name: string;
  items: string[];
  options: ModifierOption[];

  constructor(partial: Partial<ModifierData>) {
    super();
    Object.assign(this, partial);
  }
}
