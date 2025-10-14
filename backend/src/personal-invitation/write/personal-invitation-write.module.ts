import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PersonalInvitationEntity,
  PersonalInvitationSchema,
} from '../core/entities/personal-invitation.entity';
import { PersonalInvitationWriteService } from './personal-invitation-write.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PersonalInvitationEntity.name, schema: PersonalInvitationSchema },
    ]),
  ],
  providers: [PersonalInvitationWriteService],
  exports: [PersonalInvitationWriteService],
})
export class PersonalInvitationWriteModule {}
