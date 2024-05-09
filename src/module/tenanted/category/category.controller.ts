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
import { Pagination } from 'src/common/common.response';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto, FindCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryData } from './response/category.res';
import { isUUID } from 'class-validator';
import { LoggingInterceptor } from 'src/common/interceptor/transform.interceptor';

@ApiTags('Category')
@Controller('categories')
@UseInterceptors(LoggingInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @AuthPermissions()
  @ApiBearerAuth()
  async find(@Query() query: FindCategoryDto): Promise<Pagination<CategoryData>> {
    try {
      return await this.categoryService.find(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: category.controller.ts:23 ~ CategoryController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('active')
  @AuthPermissions()
  @ApiBearerAuth()
  async findActive(): Promise<CategoryData[]> {
    try {
      return await this.categoryService.findActive();
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: category.controller.ts:23 ~ CategoryController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @AuthPermissions()
  @ApiBearerAuth()
  async create(@CurrentUser() user: LoggedUser, @Body() input: CreateCategoryDto): Promise<CategoryData> {
    try {
      return await this.categoryService.createCategory({ input, loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: category.controller.ts:36 ~ CategoryController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<CategoryData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.categoryService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: category.controller.ts:48 ~ CategoryController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() update: UpdateCategoryDto): Promise<CategoryData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.categoryService.update({ id, updateInput: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: category.controller.ts:60 ~ CategoryController ~ update ~ error:`,
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
      return await this.categoryService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: category.controller.ts:72 ~ CategoryController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }
}
