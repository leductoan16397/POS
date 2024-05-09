import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { BaseFilterDto } from 'src/common/common.dto';

export class CreateCategoryDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  color: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  items: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;
}

export class FindCategoryDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsIn(['name', 'createdAt'])
  @IsOptional()
  sort?: 'name' | 'createdAt';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
