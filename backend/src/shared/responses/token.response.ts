import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty()
  token: string;

  @ApiPropertyOptional()
  refreshToken?: string;

  @ApiPropertyOptional()
  isNewUser?: boolean;
}
