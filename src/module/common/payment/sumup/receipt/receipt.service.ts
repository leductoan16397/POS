import { Injectable } from '@nestjs/common';
import { SumUpBaseService } from '../base/base.service';

@Injectable()
export class ReceiptService {
  readonly path = 'receipts';
  constructor(private readonly sumUpBaseService: SumUpBaseService) {}

  async retrieveReceipt({ id }: { id: string }) {
    const { data } = await this.sumUpBaseService.get({
      path: `${this.path}/${id}`,
    });
    return data;
  }
}
