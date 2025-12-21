import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, versionKey: false })
export class Review extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'ParentProfile', required: true })
  parentProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TutorProfile', required: true })
  tutorProfileId: Types.ObjectId;

  @Prop({ required: true })
  rating: number;

  @Prop()
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ tutorProfileId: 1 });
ReviewSchema.index({ parentProfileId: 1 });
