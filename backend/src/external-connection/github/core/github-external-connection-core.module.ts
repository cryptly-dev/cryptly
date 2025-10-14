import { Module } from '@nestjs/common';
import { GithubExternalConnectionReadModule } from '../read/github-external-connection-read.module';
import { GithubExternalConnectionWriteModule } from '../write/github-external-connection-write.module';
import { GithubExternalConnectionClientModule } from '../client/github-external-connection-client.module';
import { GithubExternalConnectionCoreController } from './github-external-connection-core.controller';
import { ProjectReadModule } from '../../../project/read/project-read.module';
import { RemoveProjectMemberGuard } from 'src/project/core/guards/remove-project-member.guard';
import { PROJECT_MEMBER_GUARD_REQUIRED_IMPORTS } from 'src/project/core/guards/project-member.guard';

@Module({
  imports: [
    GithubExternalConnectionReadModule,
    GithubExternalConnectionWriteModule,
    GithubExternalConnectionClientModule,
    ProjectReadModule,
    ...PROJECT_MEMBER_GUARD_REQUIRED_IMPORTS,
  ],
  controllers: [GithubExternalConnectionCoreController],
})
export class GithubExternalConnectionCoreModule {}
