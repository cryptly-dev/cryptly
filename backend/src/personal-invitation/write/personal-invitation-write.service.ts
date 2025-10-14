import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PersonalInvitationEntity } from '../core/entities/personal-invitation.entity';
import { PersonalInvitationNormalized } from '../core/entities/personal-invitation.interface';
import { PersonalInvitationSerializer } from '../core/entities/personal-invitation.serializer';
import { CreatePersonalInvitationDto } from './dto/create-personal-invitation.dto';

@Injectable()
export class PersonalInvitationWriteService {
  constructor(
    @InjectModel(PersonalInvitationEntity.name)
    private personalInvitationModel: Model<PersonalInvitationEntity>,
  ) {}

  public async create(dto: CreatePersonalInvitationDto): Promise<PersonalInvitationNormalized> {
    const invitation = await this.personalInvitationModel.create({
      ...dto,
      projectId: new Types.ObjectId(dto.projectId),
      authorId: new Types.ObjectId(dto.authorId),
      invitedUserId: new Types.ObjectId(dto.invitedUserId),
    });
    return PersonalInvitationSerializer.normalize(invitation);
  }

  public async delete(id: string): Promise<void> {
    await this.personalInvitationModel.deleteOne({ _id: new Types.ObjectId(id) });
  }
}
