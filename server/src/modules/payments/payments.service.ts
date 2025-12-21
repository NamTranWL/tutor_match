import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  Booking,
  BookingDocument,
} from '@/modules/bookings/schemas/booking.schema';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(dto: CreatePaymentDto) {
    const booking = await this.bookingModel.findById(dto.bookingId).lean();
    if (!booking) throw new BadRequestException('Booking not found');
    // Ensure booking has been migrated to profile-based references
    if (!booking.parentProfileId || !booking.tutorProfileId)
      throw new BadRequestException('Booking is not linked to profiles');

    if (Number(dto.amount) !== Number(booking.amount))
      throw new BadRequestException(
        'Payment amount does not match booking amount',
      );

    try {
      const payload: any = {
        bookingId: new Types.ObjectId(dto.bookingId),
        amount: dto.amount,
        date: new Date(dto.date),
        method: dto.method,
        status: dto.status || 'paid',
      };
      const doc = await this.paymentModel.create(payload);
      return { _id: doc._id };
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      throw new InternalServerErrorException('Create payment failed');
    }
  }

  async findAll(query: any) {
    try {
      const { default: aqp } = await Function(
        'return import("api-query-params")',
      )();
      const { filter: raw = {}, sort } = aqp(query || {});
      const filter: Record<string, any> = { ...(raw as Record<string, any>) };
      delete filter.current;
      delete filter.pageSize;
      const current = Number(query?.current) > 0 ? Number(query.current) : 1;
      const rawSize = Number(query?.pageSize) > 0 ? Number(query.pageSize) : 10;
      const pageSize = Math.min(100, rawSize);
      const skip = (current - 1) * pageSize;

      const results = await this.paymentModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort((sort as any) ?? { createdAt: -1 })
        .lean();
      const totalItems = await this.paymentModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / pageSize);
      return { results, totalPages };
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      throw new InternalServerErrorException('findAll failed');
    }
  }

  async findOne(id: string) {
    const doc = await this.paymentModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Payment not found');
    return doc;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const updated = await this.paymentModel
      .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Payment not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.paymentModel.deleteOne({ _id: id });
    if (res.deletedCount === 0)
      throw new NotFoundException('Payment not found');
    return { deleted: true, id };
  }
}
