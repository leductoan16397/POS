import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { BaseFilterDto } from 'src/common/common.dto';
import { StringObject } from 'src/common/interface';
import { ShowType, SoldType } from '../entity/item.entity';
import { SkuType } from '../utils/item.variant.cons';

export class PriceAndStock {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ required: false })
  cost?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  sku?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  @Min(0)
  inStock: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  @Min(0)
  lowStock?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  @Min(0)
  optimalStock?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  barcode?: string;
}

export class ItemStore {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID('all')
  storeId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty()
  @IsOptional()
  @Min(0)
  @IsNumber()
  price?: number;
}

export class ItemVariant extends PriceAndStock {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ type: () => Object })
  @IsObject()
  @IsNotEmptyObject()
  options: StringObject;

  @ApiProperty({ type: () => [ItemStore] })
  @Type(() => ItemStore)
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  stores: ItemStore[];
}

export class CreateItemDto extends PriceAndStock {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  @ValidateIf((o) => o.showType === ShowType.Image)
  image?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  color?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  icon?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(SoldType)
  soldBy: SoldType;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  trackStock?: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(ShowType)
  showType: ShowType;

  @IsString()
  @IsUUID()
  @IsOptional()
  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ type: () => [String] })
  @IsArray()
  @IsNotEmpty()
  options: string[];

  @ApiProperty({ type: () => [String] })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  modifiers?: string[];

  @ApiProperty({ type: () => [ItemVariant], required: false })
  @Type(() => ItemVariant)
  @ValidateNested({ each: true })
  @IsOptional()
  @IsArray()
  variants: ItemVariant[];
}

export class FindItemDto extends BaseFilterDto {
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
  categories?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({})
  withoutCategory?: boolean;
}

export class ExportItemDto extends PickType(FindItemDto, ['categories', 'withoutCategory']) {}

export class UpdateItemDto extends PickType(PartialType(CreateItemDto), [
  'category',
  'description',
  'name',
  'soldBy',
  'color',
  'icon',
  'showType',
  'image',
  'price',
  'cost',
  'inStock',
  'lowStock',
  'optimalStock',
  'sku',
  'variants',
  'modifiers',
  'trackStock',
  'options',
]) {}

export class CheckSkuExistsDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(SkuType)
  type: string;
}

export class CheckSkusExistsDto {
  @ApiProperty({ isArray: true, type: String, required: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skus: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(SkuType)
  type: string;
}

export class GetNextSkuDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(SkuType)
  type: string;
}
