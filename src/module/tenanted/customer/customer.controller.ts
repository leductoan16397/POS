import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthPermissions } from '../guard/guard.decorator';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, SearchCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CustomerData } from './response/customer.res';
import { isUUID } from 'class-validator';

@ApiTags('Customer')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiBearerAuth()
  @AuthPermissions()
  async find(@Query() query: SearchCustomerDto): Promise<CustomerData[]> {
    try {
      return await this.customerService.getList(query);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiBearerAuth()
  @AuthPermissions()
  async create(@Body() body: CreateCustomerDto): Promise<CustomerData> {
    try {
      return await this.customerService.store(body);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async findOne(@Param('id') id: string): Promise<CustomerData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.customerService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async update(@Param('id') id: string, @Body() body: UpdateCustomerDto): Promise<CustomerData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.customerService.update(id, body);
    } catch (error) {
      throw error;
    }
  }
}
