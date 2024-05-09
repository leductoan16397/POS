import { DEFAULT_SCHEMA } from 'src/common/constant';
import { AbstractEntity } from 'src/common/entity/abstract.entity';
import { Column, Entity } from 'typeorm';

export enum OTP_ACTION {
  signup = 'SIGNUP',
  resetPassword = 'FORGOT_PASSWORD',
}
export enum BlockOTPStatus {
  normal = 'NORMAL',
  block = 'BLOCK',
}

@Entity({ name: 'otps', schema: DEFAULT_SCHEMA })
export class OtpCode extends AbstractEntity {
  @Column()
  action: OTP_ACTION;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column()
  currentValid: number;

  @Column()
  limitInvalid: number;

  @Column()
  expireTime: Date;
}

@Entity({ name: 'block_otps', schema: DEFAULT_SCHEMA })
export class BlockOTP extends AbstractEntity {
  @Column()
  email: string;

  @Column()
  numRequest: number;

  @Column({ nullable: true })
  expireTime?: Date;

  @Column({ nullable: true })
  expireBlockTime?: Date;

  @Column()
  status: BlockOTPStatus;
}
