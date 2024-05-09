import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { CountryCode, getAllCountries } from 'countries-and-timezones';

export class UpdateCompanyConfigDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @IsIn(Object.keys(getAllCountries()))
  countryId?: CountryCode;

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
  state?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  businessName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  zipCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  currencySymbol?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false })
  minorUnit?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  timezone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  transactionPct?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  dateFormat?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  separator?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  taxCode?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({ required: false })
  decimalPlaces?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  decimalSymbol?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  timeFormat?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  language?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  nameFormat?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  currencySymbolOnLeft?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  affiliateKey?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  publicKey?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  privateKey?: string;
}
