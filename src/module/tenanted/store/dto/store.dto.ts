import { IsDate, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseFilterDto } from 'src/common/common.dto';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: string;
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}

export class GetStoreListDto extends BaseFilterDto {
  @IsString()
  @IsOptional()
  @IsIn(['name', 'createdAt'])
  @ApiProperty({ default: 'name', required: false })
  sort?: 'name' | 'createdAt';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;
}

export class EndDayReportDto {
  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  to?: Date;
}
