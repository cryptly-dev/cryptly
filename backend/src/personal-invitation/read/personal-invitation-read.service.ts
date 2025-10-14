import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersonalInvitationEntity } from '../core/entities/personal-invitation.entity';
import { PersonalInvitationNormalized } from '../core/entities/personal-invitation.interface';
import { PersonalInvitationSerializer } from '../core/entities/personal-invitation.serializer';

@Injectable()
export class PersonalInvitationReadService {
  constructor(
    @InjectModel(PersonalInvitationEntity.name)
    private personalInvitationModel: Model<PersonalInvitationEntity>,
  ) {}

  public async findByIdOrThrow(id: string): Promise<PersonalInvitationNormalized> {
    const invitation = await this.personalInvitationModel
      .findById(id)
      .lean<PersonalInvitationEntity>()
      .exec();

    if (!invitation) {
      throw new NotFoundException(`Personal invitation not found`);
    }

    return PersonalInvitationSerializer.normalize(invitation);
  }

  public async findByProjectId(projectId: string): Promise<PersonalInvitationNormalized[]> {
    const invitations = await this.personalInvitationModel
      .find({ projectId })
      .lean<PersonalInvitationEntity[]>()
      .exec();

    return invitations.map(PersonalInvitationSerializer.normalize);
  }

  public async findByInvitedUserId(invitedUserId: string): Promise<PersonalInvitationNormalized[]> {
    const invitations = await this.personalInvitationModel
      .find({ invitedUserId })
      .lean<PersonalInvitationEntity[]>()
      .exec();

    return invitations.map(PersonalInvitationSerializer.normalize);
  }
}
