import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { getAllCountries } from 'countries-and-timezones';

export class CreateCustomerDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsIn(Object.keys(getAllCountries()))
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customerCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class SearchCustomerDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  search?: string;
}
