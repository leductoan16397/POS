import { BaseResponse } from 'src/common/common.response';
import { convertNumberToFloat } from 'src/common/utils';
import { TenantUser } from '../../user/entity/tenant.user.entity';
import { Exclude } from 'class-transformer';
import { CompanyConfig } from '../../../public/company_config/entity/company.config.entity';

export class ShiftData extends BaseResponse {
  shiftNumber: number;
  openedAt: Date;
  closedAt?: Date;
  initialCash: number;
  totalPayin: number;
  totalPayout: number;
  totalCash: number;
  totalRefund?: number;
  totalCard: number;
  totalDiscount: number;
  actualCash: number;
  expectedCash: number;
  grossSales: number;
  netSales: number;
  totalCashRefund: number;
  differentCash: number;
  user?: TenantUser;
  employeeName?: string;
  storeName?: string;
  totalTax?: number;
  totalCardRefund?: number;

  @Exclude()
  companyConfig: CompanyConfig;

  constructor(partial: Partial<ShiftData>) {
    super();
    Object.assign(this, partial);
    this.expectedCash = convertNumberToFloat(
      this.initialCash +
        this.totalCash -
        this.totalCashRefund -
        this.totalCardRefund +
        this.totalPayin -
        this.totalPayout,
      this.companyConfig?.decimalPlaces ?? 2,
    );
    this.grossSales = convertNumberToFloat(
      this.totalCash + this.totalCard + this.totalDiscount,
      this.companyConfig?.decimalPlaces ?? 2,
    );
    this.totalRefund = convertNumberToFloat(
      this.totalCashRefund + this.totalCardRefund,
      this.companyConfig?.decimalPlaces ?? 2,
    );
    this.netSales = convertNumberToFloat(
      this.totalCash + this.totalCard - this.totalRefund,
      this.companyConfig?.decimalPlaces ?? 2,
    );
    this.differentCash = convertNumberToFloat(
      this.actualCash - this.expectedCash,
      this.companyConfig?.decimalPlaces ?? 2,
    );
  }
}
