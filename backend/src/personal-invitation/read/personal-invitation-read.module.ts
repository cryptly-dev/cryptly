import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PersonalInvitationEntity,
  PersonalInvitationSchema,
} from '../core/entities/personal-invitation.entity';
import { PersonalInvitationReadService } from './personal-invitation-read.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PersonalInvitationEntity.name, schema: PersonalInvitationSchema },
    ]),
  ],
  providers: [PersonalInvitationReadService],
  exports: [PersonalInvitationReadService],
})
export class PersonalInvitationReadModule {}
