import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import { CreateShiftCashDto } from './dto/shift.cash.dto';
import { ShiftCashData } from './response/shift.cash.res';
import { ShiftCashService } from './shift.cash.service';

@Controller('shifts/cashes')
@ApiTags('Shift Cashes')
export class ShiftCashController {
  constructor(private readonly shiftCashService: ShiftCashService) {}

  @Get(':shiftId')
  @AuthPermissions()
  @ApiBearerAuth()
  async listOfShift(@CurrentUser() user: LoggedUser, @Param('shiftId') shiftId: string): Promise<ShiftCashData[]> {
    try {
      return await this.shiftCashService.getListOfShift(user, shiftId);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.cash.controller.ts:22 ~ ShiftCashController ~ listOfShift ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @AuthPermissions()
  @ApiBearerAuth()
  async create(@CurrentUser() user: LoggedUser, @Body() body: CreateShiftCashDto): Promise<ShiftCashData> {
    try {
      return await this.shiftCashService.store(user, body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.cash.controller.ts:34 ~ ShiftCashController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }
}
