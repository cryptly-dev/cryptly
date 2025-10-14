import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectReadModule } from '../../project/read/project-read.module';
import { ProjectWriteModule } from '../../project/write/project-write.module';
import { UserReadModule } from '../../user/read/user-read.module';
import { PersonalInvitationReadModule } from '../read/personal-invitation-read.module';
import { PersonalInvitationWriteModule } from '../write/personal-invitation-write.module';
import {
  PersonalInvitationEntity,
  PersonalInvitationSchema,
} from './entities/personal-invitation.entity';
import { PersonalInvitationCoreController } from './personal-invitation-core.controller';

@Module({
  imports: [
    PersonalInvitationReadModule,
    PersonalInvitationWriteModule,
    MongooseModule.forFeature([
      { name: PersonalInvitationEntity.name, schema: PersonalInvitationSchema },
    ]),
    ProjectReadModule,
    ProjectWriteModule,
    UserReadModule,
  ],
  controllers: [PersonalInvitationCoreController],
})
export class PersonalInvitationCoreModule {}
