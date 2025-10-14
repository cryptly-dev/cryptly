import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectReadModule } from '../../project/read/project-read.module';
import { ProjectWriteModule } from '../../project/write/project-write.module';
import { UserReadModule } from '../../user/read/user-read.module';
import { UserWriteModule } from '../../user/write/user-write.module';
import { InvitationReadModule } from '../read/invitation-read.module';
import { InvitationTtlModule } from '../ttl/invitation-ttl.module';
import { InvitationWriteModule } from '../write/invitation-write.module';
import { InvitationEntity, InvitationSchema } from './entities/invitation.entity';
import { ProjectAdminInvitationGuard } from './guards/project-admin-invitation.guard';
import { InvitationCoreController } from './invitation-core.controller';
import { PROJECT_MEMBER_GUARD_REQUIRED_IMPORTS } from 'src/project/core/guards/project-member.guard';

@Module({
  imports: [
    InvitationReadModule,
    InvitationWriteModule,
    InvitationTtlModule,
    MongooseModule.forFeature([{ name: InvitationEntity.name, schema: InvitationSchema }]),
    UserWriteModule,
    ProjectReadModule,
    ProjectWriteModule,
    UserReadModule,
    ...PROJECT_MEMBER_GUARD_REQUIRED_IMPORTS,
  ],
  providers: [ProjectAdminInvitationGuard],
  controllers: [InvitationCoreController],
})
export class InvitationCoreModule {}
