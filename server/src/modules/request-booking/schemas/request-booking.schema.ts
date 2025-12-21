import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '@/modules/common/schemas/base.schema';

export type RequestBookingDocument = HydratedDocument<RequestBooking>;

export type RequestBookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'expired';

@Schema({ timestamps: true, versionKey: false })
export class RequestBooking extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'ParentProfile', required: true })
  parentProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TutorProfile', required: true })
  tutorProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', required: true })
  studentId: Types.ObjectId;

  // Align with Booking's single date field; this represents requested schedule time
  @Prop({ required: true })
  requestedDate: Date;

  @Prop() note?: string;

  @Prop({
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'],
    default: 'pending',
  })
  status: RequestBookingStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  adminId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: false })
  bookingId?: Types.ObjectId;

  @Prop({ type: Date, required: false })
  expiresAt?: Date;
}

export const RequestBookingSchema =
  SchemaFactory.createForClass(RequestBooking);

// Useful indexes for queries
RequestBookingSchema.index({ parentProfileId: 1, status: 1 });
RequestBookingSchema.index({ tutorProfileId: 1, status: 1 });
RequestBookingSchema.index({ status: 1, createdAt: -1 });
RequestBookingSchema.index({ createdAt: -1 });

// Prevent duplicate pending requests for same tuple
RequestBookingSchema.index(
  {
    parentProfileId: 1,
    tutorProfileId: 1,
    studentId: 1,
    requestedDate: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: { status: 'pending', isDeleted: { $ne: true } },
  },
);
