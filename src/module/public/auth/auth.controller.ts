import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponse } from './response/auth.response';
import {
  ChangePasswordDTO,
  LoginDTO,
  QuickVerifyDTO,
  RefreshTokenDTO,
  RegisterOtpDTO,
  ResetPasswordDTO,
  SelfUpdateUserDto,
} from './dto/auth.dto';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { Auth } from './decorator/auth.decorator';
import { UserRole } from 'src/common/enum';

@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({
    description: 'Login Successfully',
    type: LoginResponse,
  })
  @ApiBadRequestResponse({ description: 'Issue from Client' })
  async login(@Body() body: LoginDTO) {
    try {
      return await this.authService.login(body);
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: auth.controller.ts:33 ~ AuthController ~ login ~ error:`, error);
      throw error;
    }
  }

  @Post('logout')
  @ApiBearerAuth()
  @Auth(UserRole.CompanyAdmin)
  async logout(@CurrentUser() user: LoggedUser) {
    console.log(`${new Date().toString()} 🚀 ~ file: auth.controller.ts:32 ~ AuthController ~ logout ~ user:`, user);
    try {
      return user;
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.controller.ts:46 ~ AuthController ~ logout ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDTO) {
    try {
      const { refreshToken } = body;
      return await this.authService.refreshToken({ token: refreshToken });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.controller.ts:57 ~ AuthController ~ refreshToken ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch('password')
  @ApiBearerAuth()
  @Auth()
  async changePassword(@Body() body: ChangePasswordDTO, @CurrentUser() user: LoggedUser) {
    try {
      return await this.authService.changePassword({
        loggedUser: user,
        newPassword: body.newPassword,
        oldPassword: body.oldPassword,
      });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.controller.ts:73 ~ AuthController ~ changePassword ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('register-otp')
  async registerOtp(@Body() body: RegisterOtpDTO) {
    try {
      return await this.authService.registerOtp(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.controller.ts:83 ~ AuthController ~ registerOtp ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('quick-verify-otp')
  async quickVerifyOtp(@Body() body: QuickVerifyDTO) {
    try {
      return await this.authService.quickVerifyOtp(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.controller.ts:93 ~ AuthController ~ quickVerifyOtp ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch('reset-password')
  async forgotPassword(@Body() body: ResetPasswordDTO) {
    try {
      return await this.authService.resetPassword(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.controller.ts:103 ~ AuthController ~ forgotPassword ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('me')
  @Auth()
  @ApiBearerAuth()
  async me(@CurrentUser() user: LoggedUser) {
    try {
      return await this.authService.me({ loggedUser: user });
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: auth.controller.ts:115 ~ AuthController ~ me ~ error:`, error);
      throw error;
    }
  }

  @Patch('info')
  @Auth()
  @ApiBearerAuth()
  selfUpdate(@CurrentUser() user: LoggedUser, @Body() update: SelfUpdateUserDto) {
    try {
      return this.authService.selfUpdate({ loggedUser: user, input: update });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: auth.controller.ts:146 ~ AuthController ~ selfUpdate ~ error:`,
        error,
      );
      throw error;
    }
  }
}
