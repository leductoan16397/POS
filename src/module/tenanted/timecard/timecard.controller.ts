import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'src/common/common.response';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import {
  CheckInDTO,
  CreateTimecardDto,
  ExportTimeCardDto,
  ExportWorkedTImeDto,
  FindTimecardDto,
  FindTotalWorkedDto,
  UpdateTimecardDto,
} from './dto/timecard.dto';
import { TimecardService } from './timecard.service';
import { TimecardData } from './response/timecard.res';
import { isUUID } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import * as moment from 'moment-timezone';

@ApiTags('Timecard')
@Controller('timecards')
export class TimecardController {
  constructor(private readonly timecardService: TimecardService) {}

  @Get()
  @AuthPermissions()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async find(@Query() query: FindTimecardDto): Promise<Pagination<TimecardData>> {
    try {
      return await this.timecardService.find(query);
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
  async create(@CurrentUser() user: LoggedUser, @Body() input: CreateTimecardDto): Promise<TimecardData> {
    try {
      return await this.timecardService.createTimecard({ input, user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:36 ~ TimecardController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('total-worked')
  @AuthPermissions()
  @ApiBearerAuth()
  async totalWorked(@Query() query: FindTotalWorkedDto) {
    try {
      return await this.timecardService.totalWorked(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:48 ~ TimecardController ~ totalWorked ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('export-worked-time')
  @AuthPermissions()
  @ApiBearerAuth()
  async exportTimeWorked(@Res() res: Response, @Query() query: ExportWorkedTImeDto) {
    try {
      const from = query.from && moment(query.from).format('YYYY-MM-DD');
      const to = query.to && moment(query.to).format('YYYY-MM-DD');
      const range =
        (from && to && `${from}-${to}`) || (from && !to && `${from}-${moment().format('YYYY-MM-DD')}`) || '';

      res.header('Content-disposition', `attachment; filename=total-hours-worked${range && `-${range}`}.xlsx`);
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const items = await this.timecardService.exportWorkedTIme(query);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items));
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.end(buf);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:111 ~ TimecardController ~ exportTimeWorked ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('export')
  @AuthPermissions()
  @ApiBearerAuth()
  async export(@Res() res: Response, @Query() query: ExportTimeCardDto) {
    try {
      const from = query.from && moment(query.from).format('YYYY-MM-DD');
      const to = query.to && moment(query.to).format('YYYY-MM-DD');
      const range =
        (from && to && `${from}-${to}`) || (from && !to && `${from}-${moment().format('YYYY-MM-DD')}`) || '';

      res.header('Content-disposition', `attachment; filename=time-cards${range && `-${range}`}.xlsx`);
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const items = await this.timecardService.export(query);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items));
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.end(buf);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:136 ~ TimecardController ~ export ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('file-template')
  @AuthPermissions()
  @ApiBearerAuth()
  async template(@Res() res: Response) {
    try {
      res.header('Content-disposition', 'attachment; filename=timecard-template.xlsx');
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const items = await this.timecardService.template();
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items));
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.end(buf);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:117 ~ TimecardController ~ template ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('import')
  @AuthPermissions()
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /(sheet|xlsx)$/ })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      return await this.timecardService.import({ file });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:137 ~ TimecardController ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<TimecardData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.timecardService.findOne({ id });
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
  async update(@Param('id') id: string, @Body() update: UpdateTimecardDto): Promise<TimecardData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.timecardService.update({ id, updateInput: update });
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
      return await this.timecardService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:185 ~ TimecardController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('clock-in')
  @AuthPermissions()
  @ApiBearerAuth()
  async clockIn(@CurrentUser() user: LoggedUser, @Body() input: CheckInDTO) {
    try {
      return await this.timecardService.clockIn({ loggedUser: user, input });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:253 ~ TimecardController ~ clockIn ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('clock-out')
  @AuthPermissions()
  @ApiBearerAuth()
  async clockOut(@CurrentUser() user: LoggedUser, @Body() input: CheckInDTO) {
    try {
      return await this.timecardService.clockOut({ loggedUser: user, input });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:268 ~ TimecardController ~ clockOut ~ error:`,
        error,
      );
      throw error;
    }
  }
}
