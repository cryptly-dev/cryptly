import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { CliSessionStatus } from './cli-session-status.enum';

@Schema({ collection: 'cli_sessions', timestamps: true })
export class CliSessionEntity {
  _id: Types.ObjectId;

  @Prop({ type: String, index: true, unique: true })
  publicId: string;

  @Prop({ type: String })
  tempPublicKey: string;

  @Prop({ type: String })
  deviceName: string;

  @Prop({ type: String, enum: Object.values(CliSessionStatus), default: CliSessionStatus.Pending })
  status: CliSessionStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserEntity', required: false, default: null })
  userId: Types.ObjectId | null;

  @Prop({ type: String, required: false, default: null })
  wrappedKey: string | null;

  @Prop({ type: String, required: false, default: null })
  encryptedPrivateKey: string | null;

  // TTL index: Mongo will delete the document automatically once `expiresAt` passes.
  @Prop({ type: Date, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type CliSessionDocument = HydratedDocument<CliSessionEntity>;

export const CliSessionSchema = SchemaFactory.createForClass(CliSessionEntity);
