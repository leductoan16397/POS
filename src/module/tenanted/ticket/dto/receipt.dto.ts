import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentType } from '../utils/enum';

export class CreateReceiptDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  ticket: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @Min(0)
  totalCash: number;

  @ApiProperty({ required: true, type: 'enum', enum: PaymentType })
  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;
}

export class CompleteReceiptDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  ticket: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;
}

export class RefundReceiptDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  receiptId: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @Min(0)
  totalAmount: number;
}

export class DeleteReceiptDto {
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  ticket: string;
}
