import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { Pagination } from '../../../common/common.response';
import { AuthPermissions } from '../guard/guard.decorator';
import { DiscountService } from './discount.service';
import { CreateDiscountDto, GetByIdsDto, GetDiscountListDto, UpdateDiscountDto } from './dto/discount.dto';
import { Discount } from './entity/discount.entity';
import { DiscountData } from './response/discount.res';
import { LoggingInterceptor } from 'src/common/interceptor/transform.interceptor';

@ApiTags('Discount')
@Controller('discounts')
@UseInterceptors(LoggingInterceptor)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  @ApiBearerAuth()
  @AuthPermissions()
  async index(@Query() query: GetDiscountListDto): Promise<Pagination<Discount>> {
    try {
      return await this.discountService.getList(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: discount.controller.ts:22 ~ DiscountController ~ index ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async show(@Param() params: { id: string }): Promise<Discount> {
    try {
      if (!isUUID(params.id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.discountService.findOne(params.id);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: discount.controller.ts:33 ~ DiscountController ~ show ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @ApiBearerAuth()
  @AuthPermissions()
  async store(@Body() body: CreateDiscountDto): Promise<DiscountData> {
    try {
      return await this.discountService.store(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: discount.controller.ts:45 ~ DiscountController ~ store ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async update(@Param('id') id: string, @Body() body: UpdateDiscountDto): Promise<DiscountData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.discountService.update({ id, data: body });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: discount.controller.ts:57 ~ DiscountController ~ update ~ error:`,
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
      return await this.discountService.destroy(id);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: discount.controller.ts:69 ~ DiscountController ~ destroy ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('get-by-ids')
  @ApiBearerAuth()
  @AuthPermissions()
  async getByIds(@Body() body: GetByIdsDto) {
    try {
      return await this.discountService.findByIds(body.ids);
    } catch (e) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: discount.controller.ts ~ DiscountController ~ getByIds ~ error:`,
        e,
      );
      throw e;
    }
  }
}
