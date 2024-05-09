import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class OpenShiftDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @Min(0)
  initialCash: number;
}

export class CloseShiftDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @Min(0)
  actualCash: number;
}

export class ReportDataDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  storeId?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  to?: Date;
}
