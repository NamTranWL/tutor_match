import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from 'src/modules/common/schemas/base.schema';

export type UserDocument = HydratedDocument<User>;
export type UserRole = 'parent' | 'tutor' | 'admin';
export type UserStatus = 'active' | 'banned' | 'pending';
export type Gender = 'male' | 'female' | 'other';

@Schema({ timestamps: true, versionKey: false })
export class User extends BaseSchema {
  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    enum: ['parent', 'tutor', 'admin'],
    default: 'parent',
  })
  role: UserRole;

  @Prop() name?: string;
  @Prop() avatar?: string;
  @Prop({ enum: ['male', 'female', 'other'] }) gender?: Gender;
  @Prop() phone?: string;

  @Prop({ enum: ['active', 'banned', 'pending'], default: 'active' })
  status: UserStatus;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);
UserSchema.index({ role: 1, status: 1 });
