import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from '../../../shared/types/role.enum';

@Schema({ collection: 'personal_invitations', timestamps: true })
export class PersonalInvitationEntity {
  _id: Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'ProjectEntity' })
  public projectId: Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'UserEntity' })
  public authorId: Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'UserEntity' })
  public invitedUserId: Types.ObjectId;

  @Prop({ type: String, enum: Role })
  public role: Role;

  @Prop()
  public createdAt: Date;

  @Prop()
  public updatedAt: Date;
}

export type PersonalInvitationDocument = HydratedDocument<PersonalInvitationEntity>;

export const PersonalInvitationSchema = SchemaFactory.createForClass(PersonalInvitationEntity);
