import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BaseFilterDto } from 'src/common/common.dto';

export class ModifierOptionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  @IsNumber()
  price?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @IsInt()
  priority: number;
}

export class CreateModifierDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsUUID('all', { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty({ required: false })
  items?: string[];

  @ApiProperty({ type: () => [ModifierOptionDto], required: false })
  @Type(() => ModifierOptionDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  options: ModifierOptionDto[];
}

export class FindModifierDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsIn(['name', 'createdAt'])
  @IsOptional()
  sort?: 'name' | 'createdAt';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  items?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({})
  withoutItem?: boolean;
}

export class UpdateModifierDto extends PartialType(CreateModifierDto) {}
