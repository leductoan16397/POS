import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseFilterDto } from 'src/common/common.dto';
import { ItemTicketType, OrderType, PaymentStatus } from '../utils/enum';
import { RefundReceiptDto } from './receipt.dto';

export class ModifierDto {
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  modifierId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  optionName: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @Min(0)
  price: number;
}

export class ItemTicketDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true, type: 'enum', enum: ItemTicketType })
  @IsString()
  @IsEnum(ItemTicketType)
  @IsNotEmpty()
  type: ItemTicketType;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({})
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false, isArray: true })
  @IsArray()
  @IsOptional()
  @ValidateNested()
  modifiers?: ModifierDto[];
}

export class SaveTicketDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ required: true, type: 'enum', enum: OrderType })
  @IsString()
  @IsEnum(OrderType)
  @IsNotEmpty()
  type?: OrderType;

  @ApiProperty({ required: false })
  @IsString()
  @IsUUID()
  @IsOptional()
  customer?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsUUID()
  @IsOptional()
  shift?: string;

  @ApiProperty({ required: true, isArray: true, type: () => [ItemTicketDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemTicketDto)
  items: ItemTicketDto[];

  @ApiProperty({ required: false, isArray: true })
  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  discounts: string[];

  @ApiProperty({ required: true })
  @IsNumber()
  totalAmount: number;
}

export class UpdateTicketDto extends PartialType(SaveTicketDto) {}

export class RefundItemTicketDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  itemTicketId: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @IsPositive()
  quantity: number;
}
export class RefundTicketDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  ticket: string;

  @ApiProperty({ isArray: true, required: true, type: () => RefundItemTicketDto })
  @IsArray()
  @Type(() => RefundItemTicketDto)
  @ValidateNested({ each: true })
  items: RefundItemTicketDto[];

  @ApiProperty({ isArray: true, required: true, type: () => RefundReceiptDto })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RefundReceiptDto)
  receipts: RefundReceiptDto[];
}

export class FindTicketDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsIn(['createdAt'])
  @IsOptional()
  sort?: 'createdAt';

  @ApiProperty({ required: false, enum: PaymentStatus })
  @IsString()
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsUUID()
  @IsOptional()
  shiftId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsUUID()
  @IsOptional()
  userId: string;
}

export class SendEmailDto {
  @ApiProperty({ required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;
}
