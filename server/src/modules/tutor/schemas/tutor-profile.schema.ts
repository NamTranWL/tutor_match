import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';
import {
  GeoPoint,
  GeoPointSchema,
} from '../../common/schemas/geo-point.schema';

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
  @Prop({ type: GeoPointSchema, _id: false, required: false })
  location?: GeoPoint;

  @Prop({ enum: ['online', 'offline', 'hybrid'], default: 'online' })
  mode: TeachingMode;

  @Prop({ default: false }) isVerified: boolean;
  @Prop({ default: 0 }) ratingAvg: number;
  @Prop({ default: 0 }) ratingCount: number;

  /**
   * Recurring weekly availability blocks.
   * dayOfWeek: 0=Sun, 1=Mon, …, 6=Sat
   * startHour/endHour: 0–23 / 1–24
   */
  @Prop({
    type: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6, required: true },
        startHour: { type: Number, min: 0, max: 23, required: true },
        endHour: { type: Number, min: 1, max: 24, required: true },
      },
    ],
    default: [],
  })
  weeklyAvailability: { dayOfWeek: number; startHour: number; endHour: number }[];

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
TutorProfileSchema.index({ 'subjects.subjectId': 1, 'subjects.level': 1 });
TutorProfileSchema.index({ hourlyRate: 1 });
TutorProfileSchema.index({ ratingAvg: -1 });
TutorProfileSchema.index({ location: '2dsphere' });
