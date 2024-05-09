import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsIn, IsOptional, IsUUID, IsEnum, IsInt } from 'class-validator';
import { CountryCode, getAllCountries } from 'countries-and-timezones';
import { BaseFilterDto } from 'src/common/common.dto';
import { CompanyStatus } from 'src/common/enum';

export class RegisterCompanyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  language?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  timezone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  taxCode?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false })
  decimalPlaces?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsIn(Object.keys(getAllCountries()))
  country: CountryCode;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  state?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  zipCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  currency?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  currencyCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  currencySymbol?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  address?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class FindCompanyDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsIn(['businessName', 'ownerEmail', 'createdAt'])
  @IsOptional()
  sort?: 'businessName' | 'ownerEmail' | 'createdAt';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class ChangeStatusDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(CompanyStatus)
  status: CompanyStatus;
}
