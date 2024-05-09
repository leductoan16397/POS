import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ShiftCashType } from '../utils/shift.cash.const';

export class CreateShiftCashDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ required: true, minimum: 1 })
  amount: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  comment: string;

  @IsEnum(ShiftCashType)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'enum', enum: ShiftCashType, required: true })
  type: ShiftCashType;

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  shiftId: string;
}
