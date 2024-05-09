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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Pagination } from 'src/common/common.response';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import * as XLSX from 'xlsx';
import { AuthPermissions } from '../guard/guard.decorator';
import { CreateItemDto, ExportItemDto, FindItemDto, UpdateItemDto } from './dto/item.dto';
import { ItemService } from './item.service';
import { ItemData } from './response/item.res';
import { isUUID } from 'class-validator';
import { LoggingInterceptor } from 'src/common/interceptor/transform.interceptor';

@ApiTags('Item')
@Controller('items')
@UseInterceptors(LoggingInterceptor)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @AuthPermissions()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async find(@Body() body: FindItemDto): Promise<Pagination<ItemData>> {
    try {
      return await this.itemService.find(body);
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: item.controller.ts:43 ~ ItemController ~ find ~ error:`, error);
      throw error;
    }
  }

  @Post('/create')
  @AuthPermissions()
  @ApiBearerAuth()
  async create(@CurrentUser() user: LoggedUser, @Body() input: CreateItemDto): Promise<ItemData> {
    try {
      return await this.itemService.createItem({ input, user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: item.controller.ts:55 ~ ItemController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('export')
  @AuthPermissions()
  @ApiBearerAuth()
  async export(@Res() res: Response, @Query() query: ExportItemDto) {
    try {
      res.header('Content-disposition', 'attachment; filename=item.xlsx');
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const items = await this.itemService.export(query);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items));
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.end(buf);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: item.controller.ts:73 ~ ItemController ~ export ~ error:`,
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
      res.header('Content-disposition', 'attachment; filename=template.xlsx');
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const items = await this.itemService.template();
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(items));
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.end(buf);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: item.controller.ts:91 ~ ItemController ~ template ~ error:`,
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
    @CurrentUser() user: LoggedUser,
  ) {
    try {
      return await this.itemService.import({ file, loggedUser: user });
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: item.controller.ts:112 ~ ItemController ~ error:`, error);
      throw error;
    }
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<ItemData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.itemService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: item.controller.ts:124 ~ ItemController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() update: UpdateItemDto): Promise<ItemData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.itemService.update({ id, updateInput: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: item.controller.ts:136 ~ ItemController ~ update ~ error:`,
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
      return await this.itemService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: item.controller.ts:148 ~ ItemController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }
}
