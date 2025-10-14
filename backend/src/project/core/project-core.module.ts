import { Module } from '@nestjs/common';
import { ProjectSecretsVersionReadModule } from '../../project-secrets-version/read/project-secrets-version-read.module';
import { UserReadModule } from '../../user/read/user-read.module';
import { ProjectEventModule } from '../events/project-event.module';
import { ProjectReadModule } from '../read/project-read.module';
import { ProjectWriteModule } from '../write/project-write.module';
import { ProjectCoreController } from './project-core.controller';
import { PROJECT_MEMBER_GUARD_REQUIRED_IMPORTS } from './guards/project-member.guard';

@Module({
  imports: [
    ProjectWriteModule,
    ProjectReadModule,
    UserReadModule,
    ProjectSecretsVersionReadModule,
    ProjectEventModule,
    ...PROJECT_MEMBER_GUARD_REQUIRED_IMPORTS,
  ],
  controllers: [ProjectCoreController],
})
export class ProjectCoreModule {}
