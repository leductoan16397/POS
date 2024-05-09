import { BaseResponse } from 'src/common/common.response';
import { UserRole } from 'src/common/enum';

export class UserData extends BaseResponse {
  role: UserRole;
  name: string;
  email: string;
  pin: string;
  phone: string;

  constructor(partial: Partial<UserData>) {
    super();
    Object.assign(this, partial);
  }
}
