import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TutorScheduleSlot,
  TutorScheduleSlotDocument,
} from './schemas/tutor-schedule-slot.schema';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import {
  TutorProfile,
  TutorProfileDocument,
} from '@/modules/tutor/schemas/tutor-profile.schema';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';

@Injectable()
export class TutorScheduleService {
  private readonly logger = new Logger(TutorScheduleService.name);

  constructor(
    @InjectModel(TutorScheduleSlot.name)
    private slotModel: Model<TutorScheduleSlotDocument>,
    @InjectModel(TutorProfile.name)
    private tutorProfileModel: Model<TutorProfileDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // ─── helpers ──────────────────────────────────────────────────────────────

  private toUtcMidnight(dateStr: string): Date {
    const d = new Date(dateStr + 'T00:00:00.000Z');
    if (isNaN(d.getTime())) throw new BadRequestException('Invalid date');
    return d;
  }

  /** Resolve tutorProfileId from a tutor user's userId */
  private async getTutorProfile(tutorUserId: string) {
    const profile = await this.tutorProfileModel
      .findOne({ userId: new Types.ObjectId(tutorUserId) })
      .lean();
    if (!profile)
      throw new NotFoundException('Tutor profile not found for this user');
    return profile;
  }

  private validateHours(startHour: number, endHour: number) {
    if (endHour <= startHour)
      throw new BadRequestException('endHour must be greater than startHour');
  }

  // ─── Tutor: create a single slot ──────────────────────────────────────────

  async createSlot(tutorUserId: string, dto: CreateSlotDto) {
    this.validateHours(dto.startHour, dto.endHour);
    const profile = await this.getTutorProfile(tutorUserId);
    const date = this.toUtcMidnight(dto.date);

    try {
      const slot = await this.slotModel.create({
        tutorProfileId: profile._id,
        date,
        startHour: dto.startHour,
        endHour: dto.endHour,
        status: dto.status ?? 'available',
        note: dto.note,
      });
      return slot;
    } catch (err: any) {
      if (err.code === 11000)
        throw new ConflictException(
          'A slot already exists for this tutor on this date and startHour',
        );
      throw err;
    }
  }

  // ─── Tutor: generate slots from weeklyAvailability ────────────────────────

  async generateSlots(tutorUserId: string, dto: GenerateSlotsDto) {
    const profile = await this.getTutorProfile(tutorUserId);

    const weekly: { dayOfWeek: number; startHour: number; endHour: number }[] =
      (profile as any).weeklyAvailability ?? [];

    if (!weekly.length)
      throw new BadRequestException(
        'No weeklyAvailability configured on tutor profile. Set it first via PATCH /tutor/:id.',
      );

    const from = this.toUtcMidnight(dto.fromDate);
    const to = this.toUtcMidnight(dto.toDate);
    if (to < from)
      throw new BadRequestException('toDate must be >= fromDate');

    const maxDays = dto.maxDays ?? 60;
    const diffDays =
      Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
    if (diffDays > maxDays)
      throw new BadRequestException(
        `Date range exceeds maxDays (${maxDays}). Reduce the range.`,
      );

    // Build all (date, startHour, endHour) combos
    const toInsert: any[] = [];
    for (let i = 0; i < diffDays; i++) {
      const cur = new Date(from.getTime() + i * 86_400_000);
      const dow = cur.getUTCDay(); // 0=Sun…6=Sat
      const matching = weekly.filter((w) => w.dayOfWeek === dow);
      for (const w of matching) {
        toInsert.push({
          tutorProfileId: profile._id,
          date: cur,
          startHour: w.startHour,
          endHour: w.endHour,
          status: 'available',
        });
      }
    }

    if (!toInsert.length)
      return { created: 0, skipped: 0, message: 'No matching days in range' };

    // Ordered: false so partial inserts succeed; duplicates are skipped
    let created = 0;
    let skipped = 0;
    try {
      const res = await this.slotModel.insertMany(toInsert, {
        ordered: false,
      });
      created = res.length;
      skipped = toInsert.length - created;
    } catch (err: any) {
      // insertMany with ordered:false still throws when ALL fail, but
      // it also exposes partial results via err.result
      if (err.writeErrors || err.code === 11000) {
        created = err.insertedDocs?.length ?? 0;
        skipped = toInsert.length - created;
      } else {
        throw err;
      }
    }

    return { created, skipped, total: toInsert.length };
  }

  // ─── Tutor: list own slots ─────────────────────────────────────────────────

  async listMySlots(
    tutorUserId: string,
    query: { fromDate?: string; toDate?: string; status?: string },
  ) {
    const profile = await this.getTutorProfile(tutorUserId);
    const filter: Record<string, any> = {
      tutorProfileId: profile._id,
    };

    if (query.fromDate || query.toDate) {
      filter.date = {};
      if (query.fromDate)
        filter.date.$gte = this.toUtcMidnight(query.fromDate);
      if (query.toDate)
        filter.date.$lte = this.toUtcMidnight(query.toDate);
    }
    if (query.status) filter.status = query.status;

    return this.slotModel.find(filter).sort({ date: 1, startHour: 1 }).lean();
  }

  // ─── Tutor: update slot (only available/blocked, not booked) ──────────────

  async updateSlot(tutorUserId: string, slotId: string, dto: UpdateSlotDto) {
    const profile = await this.getTutorProfile(tutorUserId);
    const slot = await this.slotModel
      .findOne({ _id: slotId, tutorProfileId: profile._id })
      .lean();
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.status === 'booked')
      throw new ForbiddenException('Cannot modify a booked slot');

    const updated = await this.slotModel
      .findByIdAndUpdate(slotId, { $set: dto }, { new: true })
      .lean();
    return updated;
  }

  // ─── Tutor: delete slot ────────────────────────────────────────────────────

  async deleteSlot(tutorUserId: string, slotId: string) {
    const profile = await this.getTutorProfile(tutorUserId);
    const slot = await this.slotModel
      .findOne({ _id: slotId, tutorProfileId: profile._id })
      .lean();
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.status === 'booked')
      throw new ForbiddenException('Cannot delete a booked slot');

    await this.slotModel.deleteOne({ _id: slotId });
    return { deleted: true, id: slotId };
  }

  // ─── Public: get available slots for a tutor ──────────────────────────────

  async getPublicSlots(
    tutorProfileId: string,
    query: { fromDate?: string; toDate?: string },
  ) {
    if (!Types.ObjectId.isValid(tutorProfileId))
      throw new BadRequestException('Invalid tutorProfileId');

    const filter: Record<string, any> = {
      tutorProfileId: new Types.ObjectId(tutorProfileId),
      status: 'available',
    };

    if (query.fromDate || query.toDate) {
      filter.date = {};
      if (query.fromDate)
        filter.date.$gte = this.toUtcMidnight(query.fromDate);
      if (query.toDate)
        filter.date.$lte = this.toUtcMidnight(query.toDate);
    }

    return this.slotModel.find(filter).sort({ date: 1, startHour: 1 }).lean();
  }

  // ─── Internal: called by RequestBookingService when admin accepts ──────────

  async markSlotBooked(slotId: string, bookingId: Types.ObjectId) {
    const slot = await this.slotModel.findById(slotId).lean();
    if (!slot) return; // slot reference is optional — soft skip
    if (slot.status === 'booked') return;

    await this.slotModel.findByIdAndUpdate(slotId, {
      $set: { status: 'booked', bookingId },
    });
  }

  /** Called by RequestBookingService to validate slot before creating request */
  async validateSlotAvailable(slotId: string, tutorProfileId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(slotId))
      throw new BadRequestException('Invalid slotId');

    const slot = await this.slotModel.findById(slotId).lean();
    if (!slot) throw new NotFoundException('Schedule slot not found');
    if (slot.tutorProfileId.toString() !== tutorProfileId.toString())
      throw new BadRequestException('Slot does not belong to the specified tutor');
    if (slot.status !== 'available')
      throw new BadRequestException(
        `Slot is not available (current status: ${slot.status})`,
      );
    return slot;
  }
}
