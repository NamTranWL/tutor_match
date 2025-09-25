import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';

export type TutorProfileDocument = HydratedDocument<TutorProfile>;
export type TeachingMode = 'online' | 'offline' | 'hybrid';

@Schema({ timestamps: true, versionKey: false })
export class TutorProfile extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
  userId: Types.ObjectId;

  @Prop() headline?: string;
  @Prop() bio?: string;
  @Prop() yearsExp?: number;

  @Prop([String])
  teachingStyles?: string[]; // 'patient','friendly','strict',...

  @Prop({
    type: [
      { subjectId: { type: Types.ObjectId, ref: 'Subject' }, level: String },
    ],
    default: [],
  })
  subjects: { subjectId: Types.ObjectId; level?: string }[];

  @Prop({ required: true }) hourlyRate: number;
  @Prop({ default: 'VND' }) currency: string;

  @Prop({
    type: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  })
  location?: { type: 'Point'; coordinates: [number, number] };

  @Prop({ enum: ['online', 'offline', 'hybrid'], default: 'online' })
  mode: TeachingMode;

  @Prop({ default: false }) isVerified: boolean;
  @Prop({ default: 0 }) ratingAvg: number;
  @Prop({ default: 0 }) ratingCount: number;

  @Prop() nextAvailableAt?: Date;

  @Prop({
    type: [{ title: String, org: String, from: Date, to: Date }],
    default: [],
  })
  experience?: { title: string; org?: string; from?: Date; to?: Date }[];

  @Prop({
    type: [{ name: String, url: String, verified: Boolean }],
    default: [],
  })
  certificates?: { name: string; url?: string; verified?: boolean }[];
}
export const TutorProfileSchema = SchemaFactory.createForClass(TutorProfile);
TutorProfileSchema.index({ userId: 1 }, { unique: true });
TutorProfileSchema.index({ 'subjects.subjectId': 1, 'subjects.level': 1 });
TutorProfileSchema.index({ hourlyRate: 1 });
TutorProfileSchema.index({ ratingAvg: -1 });
TutorProfileSchema.index({ location: '2dsphere' });
