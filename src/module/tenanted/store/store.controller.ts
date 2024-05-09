import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { StoreService } from './store.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from '../../../common/common.response';
import { Store } from './entity/store.entity';
import { CreateStoreDto, EndDayReportDto, GetStoreListDto, UpdateStoreDto } from './dto/store.dto';
import { AuthPermissions } from '../guard/guard.decorator';
import { isUUID } from 'class-validator';
import { Response } from 'express';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import * as moment from 'moment-timezone';

@ApiTags('Store')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiBearerAuth()
  @AuthPermissions()
  async index(@Query() query: GetStoreListDto): Promise<Pagination<Store>> {
    try {
      return await this.storeService.getList(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: store.controller.ts:21 ~ StoreController ~ index ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @ApiBearerAuth()
  @AuthPermissions()
  async store(@Body() body: CreateStoreDto): Promise<Store> {
    try {
      return await this.storeService.store(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: store.controller.ts:38 ~ StoreController ~ store ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('end-day-report')
  @ApiBearerAuth()
  @AuthPermissions()
  async endDayReport(@Res() res: Response, @Query() query: EndDayReportDto, @CurrentUser() user: LoggedUser) {
    console.log(
      `${new Date().toString()} 🚀 ~ file: store.controller.ts:52 ~ StoreController ~ endDayReport ~ query:`,
      query,
    );
    try {
      const date = moment().format('YYYYMMDDHHmmss');
      res.header('Content-disposition', `attachment; filename="SAF-T Cash Register_99999989_${date}_1_1.xml"`);
      res.type('application/xml');

      const jObj = await this.storeService.endDayReport({ loggedUser: user, query });

      res.send(jObj);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: timecard.controller.ts:111 ~ TimecardController ~ exportTimeWorked ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async show(@Param() params: { id: string }): Promise<Store> {
    try {
      if (!isUUID(params.id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.storeService.findOne(params.id);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: store.controller.ts:33 ~ StoreController ~ show ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async update(@Param('id') id: string, @Body() body: UpdateStoreDto): Promise<Store> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.storeService.update({ id, data: body });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: store.controller.ts:57 ~ StoreController ~ update ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async destroy(@Param('id') id: string) {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.storeService.destroy(id);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: store.controller.ts:69 ~ StoreController ~ destroy ~ error:`,
        error,
      );
      throw error;
    }
  }
}
