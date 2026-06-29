import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ParentProfile,
  ParentProfileDocument,
} from './schemas/parent-profile.schema';
import { CreateParentProfileDto } from './dto/create-parent-profile.dto';
import { UpdateParentProfileDto } from './dto/update-parent-profile.dto';

@Injectable()
export class ParentProfileService {
  constructor(
    @InjectModel(ParentProfile.name)
    private model: Model<ParentProfileDocument>,
  ) {}

  async create(dto: CreateParentProfileDto) {
    try {
      const doc = await this.model.create({
        userId: dto.userId,
        fullName: dto.fullName,
        phone: dto.phone,
        address: dto.address,
        notes: dto.notes,
      });
      return { _id: doc._id };
    } catch (err: any) {
      if (err.code === 11000)
        throw new ConflictException('Parent profile already exists');
      throw new InternalServerErrorException('Create parent profile failed');
    }
  }

  async findByUserId(userId: string) {
    return this.model.findOne({ userId }).lean();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException('Parent profile not found');
    return doc;
  }

  async update(id: string, dto: UpdateParentProfileDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Parent profile not found');
    return updated;
  }
}
