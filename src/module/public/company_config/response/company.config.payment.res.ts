import { BaseResponse } from 'src/common/common.response';

export class CompanyConfigPaymentData extends BaseResponse {
  affiliateKey: string;
  publicKey: string;
  privateKey: string;

  constructor(partial: Partial<CompanyConfigPaymentData>) {
    super();
    Object.assign(this, partial);
  }
}
