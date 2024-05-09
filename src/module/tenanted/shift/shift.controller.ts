import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import { CloseShiftDto, OpenShiftDto, ReportDataDto } from './dto/shift.dto';
import { ShiftData } from './response/shift.res';
import { ShiftService } from './shift.service';

@ApiTags('Shift')
@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  @AuthPermissions()
  @ApiBearerAuth()
  async index(@CurrentUser() user: LoggedUser) {
    try {
      return await this.shiftService.getList(user);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.controller.ts:22 ~ ShiftController ~ index ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('history')
  @AuthPermissions()
  @ApiBearerAuth()
  async history(@CurrentUser() user: LoggedUser) {
    try {
      return await this.shiftService.getHistoryList(user);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.controller.ts:34 ~ ShiftController ~ history ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('open')
  @AuthPermissions()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async open(@CurrentUser() user: LoggedUser, @Body() body: OpenShiftDto): Promise<ShiftData> {
    try {
      return await this.shiftService.open(user, body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.controller.ts:47 ~ ShiftController ~ open ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch('close/:id')
  @AuthPermissions()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async close(
    @CurrentUser() user: LoggedUser,
    @Param('id') id: string,
    @Body() body: CloseShiftDto,
  ): Promise<ShiftData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.shiftService.close(user, id, body);
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: shift.controller.ts:64 ~ ShiftController ~ error:`, error);
      throw error;
    }
  }

  @Get('current')
  @AuthPermissions()
  @ApiBearerAuth()
  async findCurrent(@CurrentUser() user: LoggedUser): Promise<ShiftData | null> {
    try {
      return await this.shiftService.findCurrentByUser(user);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.controller.ts:76 ~ ShiftController ~ findCurrent ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('data-report')
  @AuthPermissions()
  @ApiBearerAuth()
  async reportData(@CurrentUser() user: LoggedUser, @Query() query: ReportDataDto) {
    return this.shiftService.reportData({ loggedUser: user, query });
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async find(@CurrentUser() user: LoggedUser, @Param('id') id: string): Promise<ShiftData | null> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.shiftService.find(user, id);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: shift.controller.ts:88 ~ ShiftController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }
}
