import { ApiProperty } from '@nestjs/swagger';

export class FindProjectsByRepoResponse {
  @ApiProperty()
  projectId: string;

  @ApiProperty()
  projectName: string;

  @ApiProperty({ description: 'Total github integrations on the project — useful for ranking matches.' })
  integrationCount: number;
}
