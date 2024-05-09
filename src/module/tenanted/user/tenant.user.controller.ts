import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TenantUserService } from './tenant.user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'src/common/common.response';
import { AuthPermissions } from '../guard/guard.decorator';
import { TenantUserData } from './response/tenant.user.res';
import { CreateTenantUserDto, FindTenantUserListDto, UpdateTenantUserDto } from './dto/tenant.user.dto';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { isUUID } from 'class-validator';

@ApiTags('Employee')
@Controller('employees')
export class TenantUserController {
  constructor(private readonly tenantUserService: TenantUserService) {}

  @Get()
  @AuthPermissions()
  @ApiBearerAuth()
  find(@Query() query: FindTenantUserListDto, @CurrentUser() user: LoggedUser): Promise<Pagination<TenantUserData>> {
    try {
      return this.tenantUserService.find({ query, loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: tenant.user.controller.ts:28 ~ TenantUserController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @AuthPermissions()
  @ApiBearerAuth()
  create(@Body() input: CreateTenantUserDto, @CurrentUser() user: LoggedUser): Promise<TenantUserData> {
    try {
      return this.tenantUserService.create({ input, loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: tenant.user.controller.ts:40 ~ TenantUserController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  findOne(@Param('id') id: string): Promise<TenantUserData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return this.tenantUserService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: tenant.user.controller.ts:64 ~ TenantUserController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() update: UpdateTenantUserDto): Promise<TenantUserData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return this.tenantUserService.update({ id, updateInput: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: tenant.user.controller.ts:76 ~ TenantUserController ~ update ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return this.tenantUserService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: tenant.user.controller.ts:88 ~ TenantUserController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }
}
