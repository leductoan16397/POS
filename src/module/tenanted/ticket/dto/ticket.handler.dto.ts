import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ItemTicketDto, SaveTicketDto } from './ticket.dto';

export class MergeTicketsDto {
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  mergeTicketId: string;

  @ApiProperty({ required: true })
  @IsUUID('all', { each: true })
  @IsArray()
  @ArrayMinSize(1)
  ticketIds: string[];
}

export class ReportTicketDto {
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

export class SplitTicketInfoDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;

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
  @Min(0)
  totalAmount: number;
}

export class SplitTicketsDto {
  @ApiProperty({ required: true })
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({ required: true, isArray: true, type: () => [SaveTicketDto] })
  @ValidateNested({ each: true })
  @Type(() => SplitTicketInfoDto)
  @ArrayMinSize(2)
  data: SplitTicketInfoDto[];
}
