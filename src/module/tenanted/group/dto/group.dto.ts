import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsIn, IsBoolean, ValidateIf, ArrayMinSize } from 'class-validator';
import { BaseFilterDto } from 'src/common/common.dto';
import { BackOfficePermission, POSPermission } from 'src/common/constant';

export class CreateAccessGroupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({})
  isManagePos: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({})
  isManageBackOffice: boolean;

  @ApiProperty({ type: () => [String] })
  @IsArray()
  @IsOptional()
  @IsIn(Object.values(POSPermission), { each: true })
  @ValidateIf((o: CreateAccessGroupDto) => o.isManagePos === true)
  @ArrayMinSize(1)
  managePos?: string[];

  @ApiProperty({ type: () => [String] })
  @IsArray()
  @IsOptional()
  @IsIn(Object.values(BackOfficePermission), { each: true })
  @ValidateIf((o: CreateAccessGroupDto) => o.isManageBackOffice === true)
  @ArrayMinSize(1)
  manageBackOffice?: string[];
}

export class FindAccessGroupDto extends BaseFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsIn(['name', 'createdAt'])
  @IsOptional()
  sort?: 'name' | 'createdAt';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateTenantUserGroupDto extends PartialType(CreateAccessGroupDto) {}
