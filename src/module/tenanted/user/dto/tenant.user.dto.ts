import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  // IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { BaseFilterDto } from 'src/common/common.dto';

export class CreateTenantUserDto {
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
  @ApiProperty()
  phone?: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  inviteBackOffice: boolean;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID('all')
  group?: string;
}

export class UpdateTenantUserDto extends PickType(PartialType(CreateTenantUserDto), [
  'group',
  'name',
  'phone',
  'pin',
]) {}

export class FindTenantUserListDto extends BaseFilterDto {
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
