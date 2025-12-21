import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import {
  ParentProfile,
  ParentProfileDocument,
} from '@/modules/parent-profile/schemas/parent-profile.schema';
import {
  TutorProfile,
  TutorProfileDocument,
} from '@/modules/tutor/schemas/tutor-profile.schema';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ParentProfile.name)
    private parentProfileModel: Model<ParentProfileDocument>,
    @InjectModel(TutorProfile.name)
    private tutorProfileModel: Model<TutorProfileDocument>,
  ) {}

  async create(dto: CreateReviewDto) {
    // Resolve parent/tutor users -> profiles and store profile references in reviews
    const parentUser = await this.userModel.findById(dto.parentId);
    const tutorUser = await this.userModel.findById(dto.tutorId);
    if (!parentUser) throw new BadRequestException('Parent user not foundd');
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

    const parentProfile = await this.parentProfileModel
      .findOne({ userId: parentUser._id })
      .lean();
    if (!parentProfile)
      throw new BadRequestException('Parent profile not found for user');

    const tutorProfile = await this.tutorProfileModel
      .findOne({ userId: tutorUser._id })
      .lean();
    if (!tutorProfile)
      throw new BadRequestException('Tutor profile not found for user');

    try {
      const payload: any = {
        parentProfileId: parentProfile._id,
        tutorProfileId: tutorProfile._id,
        rating: dto.rating,
        comment: dto.comment,
      };
      const doc = await this.reviewModel.create(payload);
      return { _id: doc._id };
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      throw new InternalServerErrorException('Create review failed');
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

      const results = await this.reviewModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort((sort as any) ?? { createdAt: -1 })
        .lean();
      const totalItems = await this.reviewModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / pageSize);
      return { results, totalPages };
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      throw new InternalServerErrorException('findAll failed');
    }
  }

  async findOne(id: string) {
    const doc = await this.reviewModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Review not found');
    return doc;
  }

  async update(id: string, dto: UpdateReviewDto) {
    const updated = await this.reviewModel
      .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Review not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.reviewModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) throw new NotFoundException('Review not found');
    return { deleted: true, id };
  }
}
