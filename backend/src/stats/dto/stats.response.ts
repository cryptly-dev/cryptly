import { ApiProperty } from '@nestjs/swagger';

export class StatsResponse {
  @ApiProperty()
  public users: number;

  @ApiProperty()
  public projects: number;

  @ApiProperty()
  public diffs: number;

  @ApiProperty()
  public stars: number;
}
