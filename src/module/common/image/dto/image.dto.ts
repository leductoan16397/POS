import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsOptional()
  folder: string;
}
