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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'src/common/common.response';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import { CreateModifierDto, FindModifierDto, UpdateModifierDto } from './dto/modifier.dto';
import { ModifierService } from './modifier.service';
import { ModifierData } from './response/modifier.res';
import { isUUID } from 'class-validator';

@ApiTags('Modifier')
@Controller('modifiers')
export class ModifierController {
  constructor(private readonly modifierService: ModifierService) {}

  @Post()
  @AuthPermissions()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async find(@Body() body: FindModifierDto): Promise<Pagination<ModifierData>> {
    try {
      return await this.modifierService.find(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: modifier.controller.ts:24 ~ ModifierController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('/create')
  @AuthPermissions()
  @ApiBearerAuth()
  async create(@CurrentUser() user: LoggedUser, @Body() input: CreateModifierDto): Promise<ModifierData> {
    try {
      return await this.modifierService.createModifier({ input, user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: modifier.controller.ts:36 ~ ModifierController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<ModifierData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.modifierService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: modifier.controller.ts:48 ~ ModifierController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() update: UpdateModifierDto): Promise<ModifierData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.modifierService.update({ id, updateInput: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: modifier.controller.ts:60 ~ ModifierController ~ update ~ error:`,
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
      return await this.modifierService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: modifier.controller.ts:72 ~ ModifierController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }
}
