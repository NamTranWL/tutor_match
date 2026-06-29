import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  TutorProfile,
  TutorProfileDocument,
} from './schemas/tutor-profile.schema';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TutorProfileService {
  constructor(
    @InjectModel(TutorProfile.name)
    private readonly tpModel: Model<TutorProfileDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /* ------------------------- Create ------------------------- */
  async create(dto: CreateTutorProfileDto) {
    const user = await this.userModel.findById(dto.userId);
    // location normalization was unused; keep dto.location as provided
    if (!user) throw new BadRequestException('User not found');
    if (user.role !== 'tutor') {
      throw new BadRequestException(
        'Only users with role tutor can have a tutor profile',
      );
    }
    if (!user.isActive) {
      throw new ForbiddenException('User hasn’t activated their account yet');
    }

    try {
      return await this.tpModel.create({
        userId: new Types.ObjectId(dto.userId),
        headline: dto.headline,
        bio: dto.bio,
        yearsExp: dto.yearsExp,
        teachingStyles: dto.teachingStyles ?? [],
        subjects: dto.subjects.map((s) => ({
          subjectId: new Types.ObjectId(s.subjectId),
          level: s.level,
        })),
        hourlyRate: dto.hourlyRate,
        currency: dto.currency ?? 'VND',
        location: dto.location,
        mode: dto.mode ?? 'online',
        isVerified: false,
        experience: dto.experience ?? [],
        certificates: dto.certificates ?? [],
      });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(
          'TutorProfile already exists for this user',
        );
      }
      throw err;
    }
  }

  /* ------------------------- Query List ------------------------- */
  async findAll(query: {
    userId?: string;
    subjectId?: string;
    level?: string;
    mode?: 'online' | 'offline' | 'hybrid';
    verified?: string | boolean;
    minRate?: string | number;
    maxRate?: string | number;
    lat?: string | number;
    lng?: string | number;
    maxDistanceKm?: string | number; // optional geo filter
    current?: string | number;
    pageSize?: string | number;
    sort?: 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  }) {
    const filter: FilterQuery<TutorProfileDocument> = {};

    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (query.mode) filter.mode = query.mode;
    if (query.verified !== undefined) {
      const v =
        typeof query.verified === 'string'
          ? ['1', 'true', 'yes'].includes(query.verified.toLowerCase())
          : !!query.verified;
      filter.isVerified = v;
    }

    if (query.subjectId) {
      filter['subjects.subjectId'] = new Types.ObjectId(query.subjectId);
      if (query.level) {
        filter['subjects.level'] = query.level;
      }
    }

    const price: any = {};
    if (query.minRate !== undefined) price.$gte = Number(query.minRate);
    if (query.maxRate !== undefined) price.$lte = Number(query.maxRate);
    if (Object.keys(price).length) filter.hourlyRate = price;

    const current = Math.max(1, Number(query.current ?? 1));
    const rawSize = Math.max(1, Number(query.pageSize ?? 20));
    const pageSize = Math.min(100, rawSize);
    const skip = (current - 1) * pageSize;

    // Sorting
    const sort: Record<string, 1 | -1> = {};
    switch (query.sort) {
      case 'rating':
        sort.ratingAvg = -1;
        sort.ratingCount = -1;
        break;
      case 'price_asc':
        sort.hourlyRate = 1;
        break;
      case 'price_desc':
        sort.hourlyRate = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      default:
        sort.ratingAvg = -1;
    }

    // If geo params present → use $near. Requires 2dsphere index on location (you have it).
    const lat = query.lat !== undefined ? Number(query.lat) : undefined;
    const lng = query.lng !== undefined ? Number(query.lng) : undefined;
    const maxDist =
      query.maxDistanceKm !== undefined
        ? Number(query.maxDistanceKm) * 1000
        : undefined;

    if (lat !== undefined && lng !== undefined) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          ...(maxDist ? { $maxDistance: maxDist } : {}),
        },
      } as any;
    }

    const [items, total] = await Promise.all([
      this.tpModel.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
      this.tpModel.countDocuments({
        ...filter,
        ...(filter.location ? {} : {}),
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return { results: items, totalPages };
  }

  /* ------------------------- Single ------------------------- */
  async findByUserId(userId: string) {
    const doc = await this.tpModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    // Do NOT throw if not found, let frontend handle null (or throw if preferred, strict me endpoint might throw)
    // If we throw, frontend receives 404 and knows to create.
    if (!doc)
      throw new NotFoundException('Tutor profile not found for this user');
    return doc;
  }

  async findOne(id: string) {
    const doc = await this.tpModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Tutor profile not found.');
    return doc;
  }

  /* ------------------------- Update ------------------------- */
  async update(id: string, dto: UpdateTutorProfileDto) {
    const update: any = {};
    if (dto.headline !== undefined) update.headline = dto.headline;
    if (dto.bio !== undefined) update.bio = dto.bio;
    if (dto.yearsExp !== undefined) update.yearsExp = dto.yearsExp;
    if (dto.teachingStyles !== undefined)
      update.teachingStyles = dto.teachingStyles;
    if (dto.subjects !== undefined) {
      update.subjects = dto.subjects.map((s) => ({
        subjectId: new Types.ObjectId(s.subjectId),
        level: s.level,
      }));
    }
    if (dto.hourlyRate !== undefined) update.hourlyRate = dto.hourlyRate;
    if (dto.currency !== undefined) update.currency = dto.currency;
    if (dto.mode !== undefined) update.mode = dto.mode;
    if (dto.isVerified !== undefined) update.isVerified = dto.isVerified;
    if (dto.weeklyAvailability !== undefined)
      update.weeklyAvailability = dto.weeklyAvailability;
    if (dto.experience !== undefined) update.experience = dto.experience;
    if (dto.certificates !== undefined) update.certificates = dto.certificates;

    const updated = await this.tpModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .lean();

    if (!updated) throw new NotFoundException('Tutor profile not found.');
    return updated;
  }

  /* ------------------------- Delete ------------------------- */
  async remove(id: string) {
    const res = await this.tpModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Tutor profile not found.');
    return { deleted: true, id };
  }
}
