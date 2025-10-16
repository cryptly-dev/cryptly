import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../../shared/types/role.enum';
@Schema({ collection: 'projects', timestamps: true, minimize: false })
export class ProjectEntity {
  _id: Types.ObjectId;

  @Prop({ required: true })
  public name: string;

  @Prop({ type: Object, default: {} })
  public members: Record<string, Role>;

  @Prop({ type: Object, default: {} })
  public encryptedSecretsKeys: Record<string, string>;

  @Prop()
  public createdAt: Date;

  @Prop()
  public updatedAt: Date;
}

export type ProjectDocument = HydratedDocument<ProjectEntity>;

export const ProjectSchema = SchemaFactory.createForClass(ProjectEntity);
