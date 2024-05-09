import { BaseResponse } from 'src/common/common.response';
import { UserRole } from 'src/common/enum';
import { TenantUserGroupData } from '../../group/response/group.res';

export class TenantUserData extends BaseResponse {
  role: UserRole;
  name: string;
  email: string;
  pin: string;
  phone: string;
  deleteAble: boolean;
  inviteBackOffice: boolean;
  group: TenantUserGroupData;

  constructor(partial: Partial<TenantUserData>) {
    super();
    Object.assign(this, partial);
  }
}
