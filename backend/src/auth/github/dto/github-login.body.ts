import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GithubLoginBody {
  @ApiProperty()
  githubCode: string;

  @ApiPropertyOptional()
  forceLocalLogin?: boolean;
}
