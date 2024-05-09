import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TenantUserGroupService as AccessGroupService } from './group.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'src/common/common.response';
import { TenantUserGroupData } from './response/group.res';
import { CreateAccessGroupDto, FindAccessGroupDto, UpdateTenantUserGroupDto } from './dto/group.dto';
import { AuthPermissions } from '../guard/guard.decorator';
import { isUUID } from 'class-validator';

@ApiTags('access Groups')
@Controller('access-groups')
export class TenantUserGroupController {
  constructor(private readonly accessGroupService: AccessGroupService) {}

  @Get()
  @AuthPermissions()
  @ApiBearerAuth()
  async find(@Query() query: FindAccessGroupDto): Promise<Pagination<TenantUserGroupData>> {
    try {
      return await this.accessGroupService.find(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: group.controller.ts:21 ~ TenantUserGroupController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @AuthPermissions()
  @ApiBearerAuth()
  async create(@Body() input: CreateAccessGroupDto): Promise<TenantUserGroupData> {
    try {
      return await this.accessGroupService.create({ input });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: group.controller.ts:33 ~ TenantUserGroupController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<TenantUserGroupData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.accessGroupService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: group.controller.ts:45 ~ TenantUserGroupController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() update: UpdateTenantUserGroupDto): Promise<TenantUserGroupData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.accessGroupService.update({ id, updateInput: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: group.controller.ts:57 ~ TenantUserGroupController ~ update ~ error:`,
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
      return await this.accessGroupService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: group.controller.ts:69 ~ TenantUserGroupController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }
}
