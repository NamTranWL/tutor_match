import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import {
  ParentProfile,
  ParentProfileDocument,
} from '@/modules/parent-profile/schemas/parent-profile.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '@/modules/student-profile/schemas/student-profile.schema';
import {
  TutorProfile,
  TutorProfileDocument,
} from '@/modules/tutor/schemas/tutor-profile.schema';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ParentProfile.name)
    private parentProfileModel: Model<ParentProfileDocument>,
    @InjectModel(StudentProfile.name)
    private studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(TutorProfile.name)
    private tutorProfileModel: Model<TutorProfileDocument>,
  ) {}

  async create(dto: CreateBookingDto) {
    // Support two creation modes:
    // 1) client provides parentId/tutorId (User IDs) -> resolve to profiles
    // 2) client provides parentProfileId/tutorProfileId (Profile IDs) -> use directly
    let parentProfile: any = null;
    let tutorProfile: any = null;
    let student: any = null;

    if (dto.parentProfileId && dto.tutorProfileId) {
      // Profile-based path
      parentProfile = await this.parentProfileModel
        .findById(dto.parentProfileId)
        .lean();
      if (!parentProfile)
        throw new BadRequestException('Parent profile not found');

      tutorProfile = await this.tutorProfileModel
        .findById(dto.tutorProfileId)
        .lean();
      if (!tutorProfile)
        throw new BadRequestException('Tutor profile not found');

      student = await this.studentProfileModel.findById(dto.studentId).lean();
      if (!student) throw new BadRequestException('Student not found');
      if (student.parentId.toString() !== parentProfile._id.toString())
        throw new BadRequestException(
          'Student does not belong to the provided parent',
        );

      // Optionally validate underlying users' status if linked
      if (parentProfile.userId) {
        const pUser = await this.userModel.findById(parentProfile.userId);
        if (!pUser) throw new BadRequestException('Parent user not found');
        if (pUser.role !== 'parent')
          throw new BadRequestException(
            'Linked parent user does not have parent role',
          );
        if (!pUser.isActive)
          throw new ForbiddenException('Parent account is not active');
      }
      if (tutorProfile.userId) {
        const tUser = await this.userModel.findById(tutorProfile.userId);
        if (!tUser) throw new BadRequestException('Tutor user not found');
        if (tUser.role !== 'tutor')
          throw new BadRequestException(
            'Linked tutor user does not have tutor role',
          );
        if (!tUser.isActive)
          throw new ForbiddenException('Tutor account is not active');
      }
    } else {
      // User-based path (existing behavior)
      const parentUser = await this.userModel.findById(dto.parentId);
      const tutorUser = await this.userModel.findById(dto.tutorId);
      if (!parentUser) throw new BadRequestException('Parent user not found');
      if (!tutorUser) throw new BadRequestException('Tutor user not found');
      if (parentUser.role !== 'parent')
        throw new BadRequestException(
          'Provided parentId does not belong to a parent',
        );
      if (tutorUser.role !== 'tutor')
        throw new BadRequestException(
          'Provided tutorId does not belong to a tutor',
        );
      if (!parentUser.isActive)
        throw new ForbiddenException('Parent account is not active');
      if (!tutorUser.isActive)
        throw new ForbiddenException('Tutor account is not active');

      parentProfile = await this.parentProfileModel
        .findOne({ userId: parentUser._id })
        .lean();
      if (!parentProfile)
        throw new BadRequestException('Parent profile not found for user');

      student = await this.studentProfileModel.findById(dto.studentId).lean();
      if (!student) throw new BadRequestException('Student not found');
      if (student.parentId.toString() !== parentProfile._id.toString())
        throw new BadRequestException(
          'Student does not belong to the provided parent',
        );

      tutorProfile = await this.tutorProfileModel
        .findOne({ userId: tutorUser._id })
        .lean();
      if (!tutorProfile)
        throw new BadRequestException('Tutor profile not found for user');
    }

    try {
      const payload: any = {
        parentProfileId: new Types.ObjectId(parentProfile._id),
        studentId: new Types.ObjectId(student._id),
        tutorProfileId: new Types.ObjectId(tutorProfile._id),
        date: new Date(dto.date),
        amount: dto.amount,
        status: dto.status || 'pending',
      };
      const doc = await this.bookingModel.create(payload);
      return { _id: doc._id };
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      throw new InternalServerErrorException('Create booking failed');
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

      // Convert string IDs to ObjectIds for proper MongoDB matching
      if (filter.parentProfileId) {
        filter.parentProfileId = new Types.ObjectId(filter.parentProfileId);
      }
      if (filter.tutorProfileId) {
        filter.tutorProfileId = new Types.ObjectId(filter.tutorProfileId);
      }
      if (filter.studentId) {
        filter.studentId = new Types.ObjectId(filter.studentId);
      }

      const current = Number(query?.current) > 0 ? Number(query.current) : 1;
      const rawSize = Number(query?.pageSize) > 0 ? Number(query.pageSize) : 10;
      const pageSize = Math.min(100, rawSize);
      const skip = (current - 1) * pageSize;

      const resultsRaw = await this.bookingModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any)
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
        .populate({ path: 'studentId', select: 'fullName' })
        .lean();

      const results = (resultsRaw || []).map((doc: any) => {
        const parentUser = doc?.parentProfileId?.userId;
        const tutorUser = doc?.tutorProfileId?.userId;
        const student = doc?.studentId;
        return {
          ...doc,
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
          student: student ? { name: student?.fullName } : undefined,
        };
      });
      const totalItems = await this.bookingModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / pageSize);
      return { results, totalPages };
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      throw new InternalServerErrorException('findAll failed');
    }
  }

  async getStats(query: any) {
    try {
      const { default: aqp } = await Function(
        'return import("api-query-params")',
      )();
      const { filter: raw = {} } = aqp(query || {});
      const filter: Record<string, any> = { ...(raw as Record<string, any>) };
      delete filter.current;
      delete filter.pageSize;

      // Convert string IDs
      if (filter.parentProfileId)
        filter.parentProfileId = new Types.ObjectId(filter.parentProfileId);
      if (filter.tutorProfileId)
        filter.tutorProfileId = new Types.ObjectId(filter.tutorProfileId);
      if (filter.studentId)
        filter.studentId = new Types.ObjectId(filter.studentId);

      const stats = await this.bookingModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]);

      return stats[0] || { totalAmount: 0, count: 0 };
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      throw new InternalServerErrorException('getStats failed');
    }
  }

  async findOne(id: string) {
    const doc = await this.bookingModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Booking not found');
    return doc;
  }

  async update(id: string, dto: UpdateBookingDto) {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Booking not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.bookingModel.deleteOne({ _id: id });
    if (res.deletedCount === 0)
      throw new NotFoundException('Booking not found');
    return { deleted: true, id };
  }
}
