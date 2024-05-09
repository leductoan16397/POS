import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthPermissions } from '../guard/guard.decorator';
import { CheckSkuExistsDto, CheckSkusExistsDto, GetNextSkuDto } from './dto/item.dto';
import { NextSkuData } from './response/item.variant.res';
import { SkuService } from './sku.service';
import { LoggingInterceptor } from 'src/common/interceptor/transform.interceptor';

@ApiTags('Item SKU')
@Controller('sku')
@UseInterceptors(LoggingInterceptor)
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @Post('/sku-exists')
  @AuthPermissions()
  @ApiBearerAuth()
  async checkSkuExists(@Body() body: CheckSkuExistsDto): Promise<boolean> {
    try {
      return await this.skuService.checkSkuExists(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: sku.controller.ts:20 ~ SkuController ~ checkSkuExists ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('/skus-exists')
  @AuthPermissions()
  @ApiBearerAuth()
  async checkSkusExists(@Body() body: CheckSkusExistsDto): Promise<string[]> {
    try {
      return await this.skuService.checkSkusExists(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: sku.controller.ts:32 ~ SkuController ~ checkSkusExists ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('/next-sku')
  @AuthPermissions()
  @ApiBearerAuth()
  async getNextSku(@Query() query: GetNextSkuDto): Promise<NextSkuData> {
    try {
      return await this.skuService.getNextSku(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: sku.controller.ts:44 ~ SkuController ~ getNextSku ~ error:`,
        error,
      );
      throw error;
    }
  }
}
