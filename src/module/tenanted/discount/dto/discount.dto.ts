import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { BaseFilterDto } from '../../../../common/common.dto';
import { DiscountType } from '../../../../common/enum';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  code?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(DiscountType)
  type: DiscountType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  @IsPositive()
  value: number;

  @IsArray()
  @ApiProperty()
  @IsUUID('all', { each: true })
  storeIds: string[];
}

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}

export class GetDiscountListDto extends BaseFilterDto {
  @IsString()
  @IsOptional()
  @IsIn(['name', 'createdAt'])
  @ApiProperty({ default: 'name', required: false })
  sort?: 'name' | 'createdAt';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class GetByIdsDto {
  @ApiProperty({ required: true, type: 'string', isArray: true })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1)
  ids: string[];
}
