import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Pagination<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({})
  page: number;

  @ApiProperty({})
  totalPage: number;

  @ApiProperty({})
  pageSize: number;

  @ApiProperty({})
  total: number;
}
