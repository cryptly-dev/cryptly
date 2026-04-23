import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ProjectReadService } from '../project/read/project-read.service';
import { ProjectSecretsVersionReadService } from '../project-secrets-version/read/project-secrets-version-read.service';
import { UserReadService } from '../user/read/user-read.service';
import { StatsResponse } from './dto/stats.response';

const CACHE_TTL_MS = 5_000;
const GITHUB_REPO = 'cryptly-dev/cryptly';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  private cache: { value: StatsResponse; expiresAt: number } | null = null;
  private inflight: Promise<StatsResponse> | null = null;

  constructor(
    private readonly userReadService: UserReadService,
    private readonly projectReadService: ProjectReadService,
    private readonly versionReadService: ProjectSecretsVersionReadService,
  ) {}

  public async getStats(): Promise<StatsResponse> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.value;
    }
    if (this.inflight) {
      return this.inflight;
    }

    this.inflight = this.computeStats()
      .then((value) => {
        this.cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
        return value;
      })
      .finally(() => {
        this.inflight = null;
      });

    return this.inflight;
  }

  private async computeStats(): Promise<StatsResponse> {
    const [users, projects, diffs, stars] = await Promise.all([
      this.userReadService.countAll(),
      this.projectReadService.countAll(),
      this.versionReadService.countAll(),
      this.fetchGithubStars(),
    ]);

    return { users, projects, diffs, stars };
  }

  private async fetchGithubStars(): Promise<number> {
    try {
      const { data } = await axios.get<{ stargazers_count: number }>(
        `https://api.github.com/repos/${GITHUB_REPO}`,
        {
          timeout: 3_000,
          headers: { Accept: 'application/vnd.github+json' },
        },
      );
      return data.stargazers_count ?? 0;
    } catch (err) {
      this.logger.warn(
        `Failed to fetch GitHub stars: ${(err as Error).message}`,
      );
      return this.cache?.value.stars ?? 0;
    }
  }
}
