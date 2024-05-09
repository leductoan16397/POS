import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty()
  username: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  id: string;
}
