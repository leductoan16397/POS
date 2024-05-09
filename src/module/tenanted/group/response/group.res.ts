import { Exclude } from 'class-transformer';
import { BaseResponse } from 'src/common/common.response';

export class TenantUserGroupData extends BaseResponse {
  name: string;
  deleteAble: boolean;
  updateAble: boolean;
  isManagePos: boolean;
  isManageBackOffice: boolean;
  managePos: string[];
  manageBackOffice: string[];
  totalEmployee?: number;

  @Exclude()
  staffs: any[];

  constructor(partial: Partial<TenantUserGroupData>) {
    super();
    Object.assign(this, partial);
  }
}
