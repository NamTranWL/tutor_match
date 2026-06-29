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

  async create(adminUserId: string, dto: CreatePaymentDto) {
    const booking = await this.bookingModel.findById(dto.bookingId).lean();
    if (!booking) throw new BadRequestException('Booking not found');
    if (!booking.parentProfileId || !booking.tutorProfileId)
      throw new BadRequestException('Booking is not linked to profiles');

    const amount = dto.amount ?? booking.amount;
    if (!amount || Number(amount) <= 0)
      throw new BadRequestException('Amount must be greater than 0');

    try {
      const payload: any = {
        bookingId: new Types.ObjectId(dto.bookingId),
        amount,
        method: dto.method,
        status: dto.status || 'pending',
        note: dto.note,
        createdBy: new Types.ObjectId(adminUserId),
      };
      if (payload.status === 'paid') payload.paidAt = new Date();
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

      const resultsRaw = await this.paymentModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort((sort as any) ?? { createdAt: -1 })
        .populate({
          path: 'bookingId',
          select: 'status date amount parentProfileId tutorProfileId studentId',
          populate: [
            {
              path: 'parentProfileId',
              select: 'userId',
              populate: { path: 'userId', model: 'User', select: 'email name' },
            },
            {
              path: 'tutorProfileId',
              select: 'userId',
              populate: { path: 'userId', model: 'User', select: 'email name' },
            },
            { path: 'studentId', select: 'fullName' },
          ],
        })
        .lean();

      const results = (resultsRaw || []).map((doc: any) => {
        const booking = doc?.bookingId;
        const parentUser = booking?.parentProfileId?.userId;
        const tutorUser = booking?.tutorProfileId?.userId;
        return {
          _id: String(doc?._id ?? ''),
          amount: doc?.amount,
          method: doc?.method,
          status: doc?.status,
          createdAt: doc?.createdAt,
          paidAt: doc?.paidAt,
          note: doc?.note,
          booking: booking
            ? {
                _id: String(booking?._id ?? ''),
                status: booking?.status,
                requestedDate: booking?.date,
                amount: booking?.amount,
                parent: parentUser
                  ? {
                      userId: String(parentUser?._id ?? ''),
                      email: parentUser?.email,
                      name: parentUser?.name,
                    }
                  : undefined,
                tutor: tutorUser
                  ? {
                      userId: String(tutorUser?._id ?? ''),
                      email: tutorUser?.email,
                      name: tutorUser?.name,
                    }
                  : undefined,
              }
            : undefined,
        };
      });
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

  /**
   * Auto-create a payment when a request booking is accepted.
   * - Guards against duplicates by bookingId.
   * - Uses defaults: method=cash, status=pending.
   * - Returns the created or existing payment as a lean document.
   */
  async createForBookingOnAccept(params: {
    adminUserId: string;
    bookingId: string;
    amount: number;
  }) {
    const { adminUserId, bookingId, amount } = params;
    if (!bookingId) throw new BadRequestException('bookingId is required');
    if (!amount || Number(amount) <= 0)
      throw new BadRequestException('Amount must be greater than 0');

    // If a payment already exists for this booking, return it (idempotent behavior)
    const existing = await this.paymentModel
      .findOne({ bookingId: new Types.ObjectId(bookingId) })
      .lean();
    if (existing) {
      this.logger.log(
        `Skip auto-create payment: existing found for bookingId=${bookingId}`,
      );
      return existing;
    }

    try {
      const payload: any = {
        bookingId: new Types.ObjectId(bookingId),
        amount,
        method: 'cash',
        status: 'pending',
        createdBy: new Types.ObjectId(adminUserId),
        note: 'Auto-created on request-booking accept',
      };
      const doc = await this.paymentModel.create(payload);
      this.logger.log(
        `Auto-created payment ${String(doc._id)} for bookingId=${bookingId}`,
      );
      return await this.paymentModel.findById(doc._id).lean();
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      // Bubble up; caller decides whether to fail or continue
      throw new InternalServerErrorException('Auto-create payment failed');
    }
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const update: any = { ...dto };
    if (dto.status === 'paid') update.paidAt = new Date();
    if (dto.status && dto.status !== 'paid') update.paidAt = undefined;

    const updated = await this.paymentModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Payment not found');

    // If status changed to 'paid', update the associated booking to 'active'
    if (dto.status === 'paid' && updated.bookingId) {
      await this.bookingModel.findByIdAndUpdate(updated.bookingId, {
        status: 'active',
      });
    }

    return updated;
  }

  async remove(id: string) {
    const res = await this.paymentModel.deleteOne({ _id: id });
    if (res.deletedCount === 0)
      throw new NotFoundException('Payment not found');
    return { deleted: true, id };
  }
}
