import { isNumber, isNumberString } from 'class-validator';

export class DecimalColumnTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string | null): number | null | string {
    return (data && (isNumber(data) || isNumberString(data)) && parseFloat(data)) || data;
  }
}
