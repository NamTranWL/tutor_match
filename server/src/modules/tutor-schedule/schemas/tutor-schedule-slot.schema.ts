import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TutorScheduleSlotDocument = HydratedDocument<TutorScheduleSlot>;
export type SlotStatus = 'available' | 'booked' | 'blocked';

@Schema({ timestamps: true, versionKey: false })
export class TutorScheduleSlot {
  @Prop({ type: Types.ObjectId, ref: 'TutorProfile', required: true })
  tutorProfileId: Types.ObjectId;

  /** Date-only (stored as UTC midnight, e.g. 2025-07-14T00:00:00.000Z) */
  @Prop({ required: true })
  date: Date;

  /** 0–23 */
  @Prop({ required: true, min: 0, max: 23 })
  startHour: number;

  /** 1–24 (must be > startHour) */
  @Prop({ required: true, min: 1, max: 24 })
  endHour: number;

  @Prop({ enum: ['available', 'booked', 'blocked'], default: 'available' })
  status: SlotStatus;

  /** Populated when status becomes 'booked' */
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: false })
  bookingId?: Types.ObjectId;

  /** Optional note from tutor (e.g. "offline only this day") */
  @Prop({ required: false })
  note?: string;
}

export const TutorScheduleSlotSchema =
  SchemaFactory.createForClass(TutorScheduleSlot);

// One slot per tutor per date+hour window
TutorScheduleSlotSchema.index(
  { tutorProfileId: 1, date: 1, startHour: 1 },
  { unique: true },
);
TutorScheduleSlotSchema.index({ tutorProfileId: 1, date: 1, status: 1 });
TutorScheduleSlotSchema.index({ date: 1, status: 1 });
