import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiPropertyOptional()
  isNewUser?: boolean;
}
