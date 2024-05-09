import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'src/common/common.response';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import { isUUID } from 'class-validator';
import { TransactionHistoryService } from './transaction.history.service';
import { TransactionHistoryData } from './response/transaction.history.res';
import {
  FindTransactionHistoryDto,
  CreateTransactionHistoryDto,
  UpdateTransactionHistoryDto,
} from './dto/transaction.history.dto';

@ApiTags('Transaction History')
@Controller('transactions')
export class TransactionHistoryController {
  constructor(private readonly transactionHistoryService: TransactionHistoryService) {}

  @Get()
  @AuthPermissions()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async find(
    @Query() query: FindTransactionHistoryDto,
    @CurrentUser() user: LoggedUser,
  ): Promise<Pagination<TransactionHistoryData>> {
    try {
      return await this.transactionHistoryService.find({ query, loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:24 ~ TimecardController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @AuthPermissions()
  @ApiBearerAuth()
  async create(
    @CurrentUser() user: LoggedUser,
    @Body() input: CreateTransactionHistoryDto,
  ): Promise<TransactionHistoryData> {
    try {
      return await this.transactionHistoryService.create({ input, loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:36 ~ TimecardController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<TransactionHistoryData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.transactionHistoryService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:155 ~ TimecardController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() update: UpdateTransactionHistoryDto): Promise<TransactionHistoryData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.transactionHistoryService.update({ id, updateInput: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:170 ~ TimecardController ~ update ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.transactionHistoryService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:185 ~ TimecardController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }
}
