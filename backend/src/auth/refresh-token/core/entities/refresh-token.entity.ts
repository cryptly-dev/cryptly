import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ collection: 'refresh_tokens', timestamps: true })
export class RefreshTokenEntity {
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserEntity', index: true })
  public userId: Types.ObjectId;

  @Prop({ type: String, index: true })
  public tokenHash: string;

  @Prop({ type: Date })
  public expiresAt: Date;

  @Prop({ type: Date, required: false, default: null })
  public revokedAt: Date | null;

  @Prop()
  public createdAt: Date;

  @Prop()
  public updatedAt: Date;
}

export type RefreshTokenDocument = HydratedDocument<RefreshTokenEntity>;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshTokenEntity);
