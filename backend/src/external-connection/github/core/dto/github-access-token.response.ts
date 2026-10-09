import { ApiProperty } from '@nestjs/swagger';

export class GithubAccessTokenResponse {
  @ApiProperty()
  token: string;
}
