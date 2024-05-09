import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  // IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { BaseFilterDto } from 'src/common/common.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNumberString()
  @IsNotEmpty()
  @Length(4)
  @ApiProperty()
  pin: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  // @IsPhoneNumber()
  @IsOptional()
  @ApiPropertyOptional()
  phone?: string;
}

export class UpdateUserDto extends PickType(PartialType(CreateUserDto), ['name', 'phone', 'pin']) {}

export class FindUserListDto extends BaseFilterDto {
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
