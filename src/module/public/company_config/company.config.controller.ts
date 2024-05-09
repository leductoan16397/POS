import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/enum';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { Auth } from '../auth/decorator/auth.decorator';
import { CompanyConfigService } from './company.config.service';
import { UpdateCompanyConfigDto } from './dto/company.config.dto';

@Controller('company-configs')
@ApiTags('Company Config')
export class CompanyConfigController {
  constructor(private readonly companyConfigService: CompanyConfigService) {}

  @Get()
  @Auth(UserRole.CompanyOwner, UserRole.CompanyUser, UserRole.CompanyAdmin)
  @ApiBearerAuth()
  async findOne(@CurrentUser() user: LoggedUser) {
    try {
      return await this.companyConfigService.findOne({ loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: company.config.controller.ts:22 ~ CompanyConfigController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Get('/payment')
  @Auth(UserRole.CompanyOwner, UserRole.CompanyUser, UserRole.CompanyAdmin)
  @ApiBearerAuth()
  async findPayment(@CurrentUser() user: LoggedUser) {
    try {
      return await this.companyConfigService.findPayment({ loggedUser: user });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: company.config.controller.ts:22 ~ CompanyConfigController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch()
  @Auth(UserRole.CompanyOwner, UserRole.CompanyAdmin)
  @ApiBearerAuth()
  async update(@CurrentUser() user: LoggedUser, @Body() body: UpdateCompanyConfigDto) {
    try {
      return await this.companyConfigService.update({ loggedUser: user, updateInput: body });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: company.config.controller.ts:34 ~ CompanyConfigController ~ update ~ error:`,
        error,
      );
      throw error;
    }
  }
}
