import { CountryCode, getCountry } from 'countries-and-timezones';
import { BaseResponse } from 'src/common/common.response';

export class CustomerData extends BaseResponse {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: CountryCode;
  countryName?: string;
  customerCode?: string;
  note?: string;
  points?: number;
  visitCount: number;
  lastVisit?: Date;

  constructor(partial: Partial<CustomerData>) {
    super();
    Object.assign(this, partial);

    this.countryName = this.country ? getCountry(this.country).name : null;
  }
}
