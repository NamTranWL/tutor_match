import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Booking,
  BookingDocument,
} from '@/modules/bookings/schemas/booking.schema';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getOverview() {
    const tutorsPromise = this.userModel.countDocuments({
      role: 'tutor',
      isDeleted: { $ne: true },
    });
    const parentsPromise = this.userModel.countDocuments({
      role: 'parent',
      isDeleted: { $ne: true },
    });
    const bookingsPromise = this.bookingModel.countDocuments({
      isDeleted: { $ne: true },
    });

    const revenueAgg = await this.bookingModel.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const revenue = revenueAgg?.[0]?.total ?? 0;

    const recentRaw = await this.bookingModel
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'parentProfileId',
        select: 'userId',
        populate: { path: 'userId', model: 'User', select: 'email name' },
      })
      .populate({
        path: 'tutorProfileId',
        select: 'userId',
        populate: { path: 'userId', model: 'User', select: 'email name' },
      })
      .lean();

    const recentBookings = (recentRaw || []).map((doc: any) => {
      const parentUser = doc?.parentProfileId?.userId;
      const tutorUser = doc?.tutorProfileId?.userId;
      const parentProfileId = String(
        doc?.parentProfileId?._id ?? doc.parentProfileId,
      );
      const tutorProfileId = String(
        doc?.tutorProfileId?._id ?? doc.tutorProfileId,
      );
      return {
        _id: String(doc._id),
        parentProfileId,
        tutorProfileId,
        date: doc.date,
        amount: doc.amount,
        status: doc.status,
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
      };
    });

    const [tutors, parents, bookings] = await Promise.all([
      tutorsPromise,
      parentsPromise,
      bookingsPromise,
    ]);

    return {
      tutors,
      parents,
      bookings,
      revenue,
      recentBookings,
    };
  }
}
