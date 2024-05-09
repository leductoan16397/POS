import { Body, Controller, Delete, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import { CompleteReceiptDto, CreateReceiptDto, DeleteReceiptDto } from './dto/receipt.dto';
import { RefundTicketDto } from './dto/ticket.dto';
import { ReceiptService } from './receipt.service';
import { ReceiptData } from './response/receipt.res';
import { TicketData } from './response/ticket.res';
import { LoggingInterceptor } from 'src/common/interceptor/transform.interceptor';

@ApiTags('Receipts')
@Controller('receipts')
@UseInterceptors(LoggingInterceptor)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  @ApiBearerAuth()
  @AuthPermissions()
  async save(@Body() body: CreateReceiptDto): Promise<ReceiptData> {
    try {
      return await this.receiptService.store(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: receipt.controller.ts:24 ~ ReceiptController ~ save ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('complete')
  @ApiBearerAuth()
  @AuthPermissions()
  async complete(@Body() body: CompleteReceiptDto): Promise<void> {
    try {
      return await this.receiptService.complete(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: receipt.controller.ts:36 ~ ReceiptController ~ complete ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('refund')
  @ApiBearerAuth()
  @AuthPermissions()
  async refund(@CurrentUser() user: LoggedUser, @Body() body: RefundTicketDto): Promise<TicketData> {
    try {
      return await this.receiptService.refund(user, body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: receipt.controller.ts:48 ~ ReceiptController ~ refund ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Delete('delete-by-ticket')
  @ApiBearerAuth()
  @AuthPermissions()
  async delete(@CurrentUser() user: LoggedUser, @Body() body: DeleteReceiptDto): Promise<void> {
    try {
      return await this.receiptService.deleteByTicket(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: receipt.controller.ts ~ ReceiptController ~ delete ~ error:`,
        error,
      );
      throw error;
    }
  }
}
