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

  @Prop({
    enum: ['cash', 'bank_transfer', 'momo', 'vnpay', 'paypal'],
    default: 'cash',
  })
  method: 'cash' | 'bank_transfer' | 'momo' | 'vnpay' | 'paypal';

  @Prop({
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop()
  note?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
// Enforce one payment per booking to prevent duplicates on accept flow
PaymentSchema.index({ bookingId: 1 }, { unique: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
// Optional unique index to prevent multiple PAID for the same booking
// Uncomment if business requires strict uniqueness
// PaymentSchema.index(
//   { bookingId: 1, status: 1 },
//   { unique: true, partialFilterExpression: { status: 'paid' } },
// );
