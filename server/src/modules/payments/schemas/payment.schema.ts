import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from '../../common/schemas/base.schema';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true, versionKey: false })
export class Payment extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop() method: string;

  @Prop({ enum: ['paid', 'refunded', 'failed'], default: 'paid' })
  status: 'paid' | 'refunded' | 'failed';
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ date: -1 });
