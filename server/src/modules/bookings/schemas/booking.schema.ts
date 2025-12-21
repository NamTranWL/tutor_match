import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';
import {
  BOOKING_STATUSES,
  BookingStatus,
} from '../../common/constants/booking-status';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true, versionKey: false })
export class Booking extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'ParentProfile', required: true })
  parentProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TutorProfile', required: true })
  tutorProfileId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({
    enum: BOOKING_STATUSES,
    default: 'pending',
  })
  status: BookingStatus;

  @Prop({ required: true })
  amount: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ parentProfileId: 1 });
BookingSchema.index({ tutorProfileId: 1 });
BookingSchema.index({ date: 1 });
