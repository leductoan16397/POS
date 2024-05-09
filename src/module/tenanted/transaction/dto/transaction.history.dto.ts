import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { BaseFilterDto } from 'src/common/common.dto';
import { TransactionPaymentStatus } from '../utils/enum';

export class CreateTransactionHistoryDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ required: true })
  receiptId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ required: false })
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ required: false })
  tipAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ required: true })
  vatAmount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  transactionCode: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ required: true })
  foreighTransactionId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  merchentCode: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(4)
  @ApiProperty({ required: true })
  last4Digits: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  cardType: string;

  @ApiProperty({ required: false, enum: TransactionPaymentStatus })
  @IsString()
  @IsEnum(TransactionPaymentStatus)
  @IsNotEmpty()
  paymentStatus: TransactionPaymentStatus;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  paymentType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  entryMode: string;
}

export class FindTransactionHistoryDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsIn(['createdAt'])
  @IsOptional()
  sort?: 'createdAt';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateTransactionHistoryDto extends PartialType(CreateTransactionHistoryDto) {}
