import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsDate, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseFilterDto } from 'src/common/common.dto';

export class CreateTimecardDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsUUID('all')
  employee: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsUUID('all')
  store: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  clockIn: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  clockOut: Date;
}

export class CheckInDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsUUID('all')
  store: string;
}

export class FindTimecardDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsIn(['createdAt', 'clockIn', 'clockOut', 'time'])
  @IsOptional()
  sort?: 'createdAt' | 'clockIn' | 'clockOut' | 'time';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  to?: Date;
}

export class UpdateTimecardDto extends PickType(PartialType(CreateTimecardDto), ['clockIn', 'clockOut']) {}

export class FindTotalWorkedDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsUUID('all', { each: true })
  @IsOptional()
  employees?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  to?: Date;
}

export class ExportWorkedTImeDto extends PickType(PartialType(FindTotalWorkedDto), ['employees', 'from', 'to']) {}

export class ExportTimeCardDto {
  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @IsUUID('all', { each: true })
  @IsArray()
  employees?: string[];

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  to?: Date;
}
