import { ApiProperty } from '@nestjs/swagger';

export class GithubLocalMockBootstrapResponse {
  @ApiProperty()
  githubInstallationId: number;
}
