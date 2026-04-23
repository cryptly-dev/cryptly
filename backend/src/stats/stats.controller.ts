import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/core/decorators/is-public';
import { StatsResponse } from './dto/stats.response';
import { StatsService } from './stats.service';

@Controller('stats')
@ApiTags('Stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @Public()
  @ApiResponse({ type: StatsResponse })
  public getStats(): Promise<StatsResponse> {
    return this.statsService.getStats();
  }
}
