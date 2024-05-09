import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class BaseFilterDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ default: 'asc', required: false })
  order?: 'asc' | 'desc';

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number;

  @ApiProperty({ default: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
