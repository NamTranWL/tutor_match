import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';

export type StudentProfileDocument = HydratedDocument<StudentProfile>;

@Schema({ timestamps: true, versionKey: false })
export class StudentProfile extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId; // optional account for student

  @Prop({ type: Types.ObjectId, ref: 'ParentProfile', required: true })
  parentId: Types.ObjectId;

  @Prop() fullName?: string;
  @Prop({ enum: ['male', 'female', 'other'] }) gender?: string;
  @Prop() dateOfBirth?: Date;
  @Prop() school?: string;
  @Prop() grade?: string;
  @Prop() specialNeeds?: string;
}

export const StudentProfileSchema =
  SchemaFactory.createForClass(StudentProfile);
StudentProfileSchema.index({ parentId: 1 });
