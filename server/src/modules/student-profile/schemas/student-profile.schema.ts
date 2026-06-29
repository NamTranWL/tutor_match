import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';

export type StudentProfileDocument = HydratedDocument<StudentProfile>;

// Subdocument types for enhanced fields
export interface ScheduleSlot {
  start: string; // HH:mm format
  end: string;
}

export interface WeekdaySchedule {
  weekday: number; // 0 = Sunday, 6 = Saturday
  slots: ScheduleSlot[];
}

export interface Location {
  city: string;
  district?: string;
}

export interface BudgetRange {
  min: number;
  max: number;
}

export type StudentMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

@Schema({ timestamps: true, versionKey: false })
export class StudentProfile extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId; // optional account for student

  @Prop({ type: Types.ObjectId, ref: 'ParentProfile', required: true })
  parentId: Types.ObjectId;

  // Basic fields
  @Prop() fullName?: string;
  @Prop({ enum: ['male', 'female', 'other'] }) gender?: string;
  @Prop() dateOfBirth?: Date;
  @Prop() school?: string;
  @Prop() grade?: string;
  @Prop() specialNeeds?: string;

  // Enhanced fields for tutor matching
  @Prop([{ type: Types.ObjectId, ref: 'Subject' }])
  subjectsNeeded?: Types.ObjectId[];

  @Prop() gradeLevel?: string;

  @Prop() learningGoals?: string;

  @Prop({
    type: [
      {
        weekday: Number,
        slots: [{ start: String, end: String, _id: false }],
        _id: false,
      },
    ],
    default: [],
  })
  schedulePreferences?: WeekdaySchedule[];

  @Prop({ enum: ['ONLINE', 'OFFLINE', 'HYBRID'] })
  mode?: StudentMode;

  @Prop({ type: { city: String, district: String, _id: false } })
  location?: Location;

  @Prop({ type: { min: Number, max: Number, _id: false } })
  budgetRange?: BudgetRange;

  @Prop() notes?: string;
}

export const StudentProfileSchema =
  SchemaFactory.createForClass(StudentProfile);
StudentProfileSchema.index({ parentId: 1 });
