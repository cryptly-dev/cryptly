import { Module } from '@nestjs/common';
import { ProjectReadModule } from '../project/read/project-read.module';
import { ProjectSecretsVersionReadModule } from '../project-secrets-version/read/project-secrets-version-read.module';
import { UserReadModule } from '../user/read/user-read.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [UserReadModule, ProjectReadModule, ProjectSecretsVersionReadModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
