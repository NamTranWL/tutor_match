import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';

export type ParentProfileDocument = HydratedDocument<ParentProfile>;

@Schema({ timestamps: true, versionKey: false })
export class ParentProfile extends BaseSchema {
  @Prop({ type: String, ref: 'User', required: true, unique: true })
  userId: string;

  @Prop() fullName?: string;
  @Prop() phone?: string;
  @Prop() address?: string;
  @Prop() notes?: string;
}

export const ParentProfileSchema = SchemaFactory.createForClass(ParentProfile);
// `unique: true` on `userId` already creates an index via Mongoose
