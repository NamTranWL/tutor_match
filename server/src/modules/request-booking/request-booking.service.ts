import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RequestBooking,
  RequestBookingDocument,
} from './schemas/request-booking.schema';
import { CreateRequestBookingsDto } from './dto/create-request-bookings.dto';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import {
  ParentProfile,
  ParentProfileDocument,
} from '@/modules/parent-profile/schemas/parent-profile.schema';
import {
  TutorProfile,
  TutorProfileDocument,
} from '@/modules/tutor/schemas/tutor-profile.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '@/modules/student-profile/schemas/student-profile.schema';
import { BookingsService } from '@/modules/bookings/bookings.service';
import { PaymentsService } from '@/modules/payments/payments.service';
import { TutorScheduleService } from '@/modules/tutor-schedule/tutor-schedule.service';
import { BookingStatus } from '../common/constants/booking-status';

@Injectable()
export class RequestBookingService {
  private readonly logger = new Logger(RequestBookingService.name);
  constructor(
    @InjectModel(RequestBooking.name)
    private requestModel: Model<RequestBookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ParentProfile.name)
    private parentProfileModel: Model<ParentProfileDocument>,
    @InjectModel(TutorProfile.name)
    private tutorProfileModel: Model<TutorProfileDocument>,
    @InjectModel(StudentProfile.name)
    private studentProfileModel: Model<StudentProfileDocument>,
    private bookingsService: BookingsService,
    private paymentsService: PaymentsService,
    private tutorScheduleService: TutorScheduleService,
  ) {}

  private async getParentContext(parentUserId: string) {
    if (!parentUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const parentUser = await this.userModel.findById(parentUserId).lean();
    if (!parentUser) throw new BadRequestException('Parent user not found');
    if (parentUser.role !== 'parent')
      throw new ForbiddenException('Only parent can create booking requests');
    if (!parentUser.isActive)
      throw new ForbiddenException('Parent account is not active');

    const parentProfile = await this.parentProfileModel
      .findOne({ userId: parentUser._id })
      .lean();
    if (!parentProfile)
      throw new BadRequestException('Parent profile not found for user');
    return { parentUser, parentProfile };
  }

  private async validateStudentForParent(
    studentId: string,
    parentProfileId: Types.ObjectId,
  ) {
    const student = await this.studentProfileModel.findById(studentId).lean();
    if (!student) throw new BadRequestException('Student not found');
    if (student.parentId.toString() !== parentProfileId.toString())
      throw new BadRequestException(
        'Student does not belong to the provided parent',
      );
    return student;
  }

  private async validateTutors(tutorProfileIds: string[]) {
    // Find tutor profiles by their _id
    const profiles = await this.tutorProfileModel
      .find({ _id: { $in: tutorProfileIds } })
      .lean();

    if (profiles.length !== tutorProfileIds.length) {
      throw new BadRequestException('One or more tutor profiles not found');
    }

    // Get the associated user IDs from the tutor profiles
    const userIds = profiles.map((p) => p.userId);

    // Validate that the users exist and are tutors
    const tutors = await this.userModel
      .find({ _id: { $in: userIds }, role: 'tutor' })
      .lean();

    if (tutors.length !== profiles.length) {
      throw new BadRequestException(
        'One or more tutor users not found or not tutors',
      );
    }

    const inactive = tutors.find((t) => !t.isActive);
    if (inactive) throw new ForbiddenException('Tutor account is not active');

    // Map profiles to their users
    const userMap = new Map<string, any>();
    for (const t of tutors) userMap.set(String(t._id), t);

    const results = profiles.map((p) => ({
      user: userMap.get(String(p.userId)),
      profile: p,
    }));

    return results;
  }

  async createMany(parentUserId: string, dto: CreateRequestBookingsDto) {
    const { parentProfile } = await this.getParentContext(parentUserId);
    const student = await this.validateStudentForParent(
      dto.studentId,
      parentProfile._id,
    );
    const tutors = await this.validateTutors(dto.tutorIds);

    const requestedDate = new Date(dto.requestedDate);
    if (Number.isNaN(requestedDate.getTime()))
      throw new BadRequestException('Invalid requestedDate');

    // Validate slotId when provided — only valid for single-tutor requests
    if (dto.slotId) {
      if (tutors.length > 1)
        throw new BadRequestException(
          'slotId can only be provided when requesting a single tutor',
        );
      await this.tutorScheduleService.validateSlotAvailable(
        dto.slotId,
        tutors[0].profile._id,
      );
    }

    // Prevent duplicates per unique index. We'll also check pre-insert for cleaner error.
    const existing = await this.requestModel.countDocuments({
      parentProfileId: parentProfile._id,
      studentId: student._id,
      tutorProfileId: { $in: tutors.map((t) => t.profile._id) },
      requestedDate,
      status: 'pending',
      isDeleted: { $ne: true },
    });
    if (existing > 0)
      throw new BadRequestException(
        'Duplicate pending request exists for one or more tutors',
      );

    const slotObjectId = dto.slotId
      ? new Types.ObjectId(dto.slotId)
      : undefined;

    const docs = tutors.map((t) => ({
      parentProfileId: parentProfile._id,
      studentId: student._id,
      tutorProfileId: t.profile._id,
      requestedDate,
      note: dto.note,
      status: 'pending' as const,
      ...(slotObjectId ? { slotId: slotObjectId } : {}),
    }));

    const created = await this.requestModel.insertMany(docs);
    return created.map((d) => ({ _id: d._id, status: d.status }));
  }

  async listForParent(parentUserId: string, query: any) {
    const { parentProfile } = await this.getParentContext(parentUserId);
    const { default: aqp } = await Function(
      'return import("api-query-params")',
    )();
    const { filter: raw = {}, sort } = aqp(query || {});
    const filter: Record<string, any> = { ...(raw as Record<string, any>) };
    delete filter.current;
    delete filter.pageSize;
    filter.parentProfileId = new Types.ObjectId(parentProfile._id);
    const current = Number(query?.current) > 0 ? Number(query.current) : 1;
    const rawSize = Number(query?.pageSize) > 0 ? Number(query.pageSize) : 10;
    const pageSize = Math.min(100, rawSize);
    const skip = (current - 1) * pageSize;

    const results = await this.requestModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort((sort as any) ?? { createdAt: -1 })
      .lean();
    const totalItems = await this.requestModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    return { results, totalPages };
  }

  async listForTutor(tutorUserId: string, query: any) {
    if (!tutorUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const tutorProfile = await this.tutorProfileModel
      .findOne({ userId: new Types.ObjectId(tutorUserId) })
      .lean();
    if (!tutorProfile)
      throw new BadRequestException('Tutor profile not found for user');

    const { default: aqp } = await Function(
      'return import("api-query-params")',
    )();
    const { filter: raw2 = {}, sort } = aqp(query || {});
    const filter: Record<string, any> = { ...(raw2 as Record<string, any>) };
    delete filter.current;
    delete filter.pageSize;
    filter.tutorProfileId = new Types.ObjectId(tutorProfile._id);
    const current = Number(query?.current) > 0 ? Number(query.current) : 1;
    const rawSize = Number(query?.pageSize) > 0 ? Number(query.pageSize) : 10;
    const pageSize = Math.min(100, rawSize);
    const skip = (current - 1) * pageSize;

    const resultsRaw = await this.requestModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort((sort as any) ?? { createdAt: -1 })
      .populate({
        path: 'parentProfileId',
        select: 'userId',
        populate: { path: 'userId', model: 'User', select: 'email name' },
      })
      .populate({ path: 'studentId', select: 'fullName' })
      .lean();

    const results = (resultsRaw || []).map((doc: any) => {
      const parentUser = doc?.parentProfileId?.userId;
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
        student: student ? { name: student?.fullName } : undefined,
      };
    });

    const totalItems = await this.requestModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    return { results, totalPages };
  }

  async listForAdmin(query: any) {
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

    const resultsRaw = await this.requestModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort((sort as any) ?? { createdAt: -1 })
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

    const totalItems = await this.requestModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    return { results, totalPages };
  }

  async cancelByParent(parentUserId: string, id: string) {
    if (!parentUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const { parentProfile } = await this.getParentContext(parentUserId);
    const updated = await this.requestModel
      .findOneAndUpdate(
        { _id: id, parentProfileId: parentProfile._id, status: 'pending' },
        { status: 'cancelled' },
        { new: true },
      )
      .lean();
    if (!updated) throw new NotFoundException('Pending request not found');
    return updated;
  }

  async rejectByAdmin(adminUserId: string, id: string, reason?: string) {
    if (!adminUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    void reason; // acknowledge optional param to satisfy linting
    // admin existence validation kept simple; admin guard handles role
    const updated = await this.requestModel
      .findOneAndUpdate(
        { _id: id, status: 'pending' },
        { status: 'rejected', adminId: new Types.ObjectId(adminUserId) },
        { new: true },
      )
      .lean();
    if (!updated) throw new NotFoundException('Pending request not found');
    return updated;
  }

  async acceptByAdmin(
    adminUserId: string,
    id: string,
    amount: number,
    bookingStatus?: BookingStatus,
  ) {
    if (!adminUserId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const reqDoc = await this.requestModel.findById(id).lean();
    if (!reqDoc) throw new NotFoundException('Request not found');
    if (reqDoc.status !== 'pending')
      throw new BadRequestException('Only pending requests can be accepted');

    // Block if a booking for same intent already exists
    const existingSame = await (this.requestModel.db.model('Booking') as any)
      .findOne({
        parentProfileId: reqDoc.parentProfileId,
        studentId: reqDoc.studentId,
        tutorProfileId: reqDoc.tutorProfileId,
        date: reqDoc.requestedDate,
      })
      .lean();
    if (existingSame) {
      throw new BadRequestException(
        'A booking already exists for this schedule',
      );
    }

    // Create booking via existing service
    const payload: any = {
      parentProfileId: String(reqDoc.parentProfileId),
      tutorProfileId: String(reqDoc.tutorProfileId),
      studentId: String(reqDoc.studentId),
      date: new Date(reqDoc.requestedDate).toISOString(),
      amount,
      status: bookingStatus || 'active',
    };

    try {
      const result = await this.bookingsService.create(payload);
      const updated = await this.requestModel
        .findOneAndUpdate(
          { _id: id, status: 'pending' },
          {
            status: 'accepted',
            adminId: new Types.ObjectId(adminUserId),
            bookingId: new Types.ObjectId(result._id),
          },
          { new: true },
        )
        .lean();
      if (!updated) {
        throw new InternalServerErrorException(
          'Failed to mark request as accepted',
        );
      }

      // Option A: auto-reject other pending requests for same parent+student+requestedDate
      await this.requestModel.updateMany(
        {
          _id: { $ne: updated._id },
          parentProfileId: reqDoc.parentProfileId,
          studentId: reqDoc.studentId,
          requestedDate: reqDoc.requestedDate,
          status: 'pending',
        },
        { $set: { status: 'rejected' } },
      );

      // Mark slot as booked (non-blocking — slot reference is optional)
      if (reqDoc.slotId) {
        try {
          await this.tutorScheduleService.markSlotBooked(
            String(reqDoc.slotId),
            new Types.ObjectId(result._id),
          );
        } catch (slotErr: any) {
          this.logger.error(
            'markSlotBooked failed (non-fatal):',
            slotErr?.message,
          );
        }
      }

      // Auto-create payment for the created booking (non-blocking policy on failure)
      try {
        const payment = await this.paymentsService.createForBookingOnAccept({
          adminUserId,
          bookingId: String(result._id),
          amount,
        });
        return {
          bookingId: result._id,
          request: updated,
          paymentId: payment?._id,
        };
      } catch (paymentError: any) {
        this.logger.error(paymentError?.message, paymentError?.stack);
        // Continue without failing the accept flow
        return { bookingId: result._id, request: updated };
      }
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      if (error?.response?.message) throw error; // rethrow known HttpExceptions
      throw new InternalServerErrorException('Accept request failed');
    }
  }
}
