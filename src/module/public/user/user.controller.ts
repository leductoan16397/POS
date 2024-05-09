import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { Pagination } from 'src/common/common.response';
import { UserData } from './response/user.res';
import { CreateUserDto, FindUserListDto, UpdateUserDto } from './dto/user.dto';
import { isUUID } from 'class-validator';
import { Auth } from '../auth/decorator/auth.decorator';
import { UserRole } from 'src/common/enum';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth(UserRole.POSAdmin, UserRole.POSUser)
  @ApiBearerAuth()
  find(@Query() query: FindUserListDto, @CurrentUser() user: LoggedUser): Promise<Pagination<UserData>> {
    try {
      return this.userService.find({ query, loggedUser: user });
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: user.controller.ts:25 ~ UserController ~ find ~ error:`, error);
      throw error;
    }
  }

  @Post()
  @Auth(UserRole.POSAdmin, UserRole.POSUser)
  @ApiBearerAuth()
  create(@Body() input: CreateUserDto, @CurrentUser() user: LoggedUser): Promise<UserData> {
    try {
      return this.userService.create({ input, loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: user.controller.ts:37 ~ UserController ~ create ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get(':id')
  @Auth(UserRole.POSAdmin, UserRole.POSUser)
  @ApiBearerAuth()
  findOne(@Param('id') id: string): Promise<UserData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return this.userService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: user.controller.ts:52 ~ UserController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @Auth(UserRole.POSAdmin, UserRole.POSUser)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() update: UpdateUserDto): Promise<UserData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return this.userService.update({ id, updateInput: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: user.controller.ts:67 ~ UserController ~ update ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  @Auth(UserRole.POSAdmin, UserRole.POSUser)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return this.userService.remove({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: user.controller.ts:82 ~ UserController ~ remove ~ error:`,
        error,
      );
      throw error;
    }
  }
}
