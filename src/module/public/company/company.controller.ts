import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './entity/company.entity';
import { ChangeStatusDto, FindCompanyDto, RegisterCompanyDto } from './dto/company.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'src/common/common.response';
import { Auth } from '../auth/decorator/auth.decorator';
import { UserRole } from 'src/common/enum';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Auth(UserRole.POSAdmin, UserRole.POSUser)
  @ApiBearerAuth()
  find(@Query() query: FindCompanyDto): Promise<Pagination<Company>> {
    try {
      return this.companyService.find(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: company.controller.ts:22 ~ CompanyController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post('register-company')
  async registerCompany(@Body() body: RegisterCompanyDto) {
    try {
      return await this.companyService.registerCompany(body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: company.controller.ts:32 ~ CompanyController ~ registerCompany ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch('change-status')
  @Auth(UserRole.POSAdmin)
  @ApiBearerAuth()
  async changeStatus(@Body() body: ChangeStatusDto) {
    try {
      const { companyId, status } = body;
      return await this.companyService.changeStatus({ companyId, status });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: company.controller.ts:45 ~ CompanyController ~ changeStatus ~ error:`,
        error,
      );
      throw error;
    }
  }
}
