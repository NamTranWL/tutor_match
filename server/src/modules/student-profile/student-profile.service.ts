import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StudentProfile,
  StudentProfileDocument,
} from './schemas/student-profile.schema';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import {
  ParentProfile,
  ParentProfileDocument,
} from '@/modules/parent-profile/schemas/parent-profile.schema';

@Injectable()
export class StudentProfileService {
  constructor(
    @InjectModel(StudentProfile.name)
    private model: Model<StudentProfileDocument>,
    @InjectModel(ParentProfile.name)
    private parentModel: Model<ParentProfileDocument>,
  ) {}

  private async getParentProfileByUserId(userId: string) {
    const parent = await this.parentModel.findOne({ userId }).lean();
    if (!parent)
      throw new BadRequestException('Parent profile not found for user');
    return parent;
  }

  // Legacy create method (keeping for backward compatibility)
  async create(dto: CreateStudentProfileDto) {
    try {
      const doc = await this.model.create({
        userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
        parentId: new Types.ObjectId(dto.parentId),
        fullName: dto.fullName,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        school: dto.school,
        grade: dto.grade,
        specialNeeds: dto.specialNeeds,
        subjectsNeeded: dto.subjectsNeeded?.map((id) => new Types.ObjectId(id)),
        gradeLevel: dto.gradeLevel,
        learningGoals: dto.learningGoals,
        schedulePreferences: dto.schedulePreferences,
        mode: dto.mode,
        location: dto.location,
        budgetRange: dto.budgetRange,
        notes: dto.notes,
      });
      return { _id: doc._id };
    } catch (err: any) {
      throw new InternalServerErrorException('Create student profile failed');
    }
  }

  // New method with ownership enforcement
  async createForParent(userId: string, dto: CreateStudentProfileDto) {
    const parent = await this.getParentProfileByUserId(userId);
    const doc = await this.model.create({
      userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
      parentId: parent._id,
      fullName: dto.fullName,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      school: dto.school,
      grade: dto.grade,
      specialNeeds: dto.specialNeeds,
      subjectsNeeded: dto.subjectsNeeded?.map((id) => new Types.ObjectId(id)),
      gradeLevel: dto.gradeLevel,
      learningGoals: dto.learningGoals,
      schedulePreferences: dto.schedulePreferences,
      mode: dto.mode,
      location: dto.location,
      budgetRange: dto.budgetRange,
      notes: dto.notes,
    });
    return { _id: doc._id };
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException('Student not found');
    return doc;
  }

  async findByParentId(parentId: string) {
    return this.model.find({ parentId: new Types.ObjectId(parentId) }).lean();
  }

  // New method with ownership check
  async findByParentIdWithOwnership(userId: string, parentId: string) {
    const parent = await this.getParentProfileByUserId(userId);
    if (parent._id.toString() !== parentId) {
      throw new ForbiddenException('Cannot access other parent students');
    }
    return this.model
      .find({ parentId: new Types.ObjectId(parentId) })
      .populate('subjectsNeeded', 'name')
      .lean();
  }

  // New method with ownership check
  async findOneWithOwnership(userId: string, id: string) {
    const parent = await this.getParentProfileByUserId(userId);
    const doc = await this.model
      .findById(id)
      .populate('subjectsNeeded', 'name')
      .lean();
    if (!doc) throw new NotFoundException('Student not found');
    if (doc.parentId.toString() !== parent._id.toString()) {
      throw new ForbiddenException('Cannot access other parent students');
    }
    return doc;
  }

  async update(id: string, dto: UpdateStudentProfileDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Student not found');
    return updated;
  }

  // New method with ownership check
  async updateWithOwnership(
    userId: string,
    id: string,
    dto: UpdateStudentProfileDto,
  ) {
    const parent = await this.getParentProfileByUserId(userId);
    const existing = await this.model.findById(id).lean();
    if (!existing) throw new NotFoundException('Student not found');
    if (existing.parentId.toString() !== parent._id.toString()) {
      throw new ForbiddenException('Cannot update other parent students');
    }

    const updateData: any = { ...dto };
    if (dto.dateOfBirth) {
      updateData.dateOfBirth = new Date(dto.dateOfBirth);
    }
    if (dto.subjectsNeeded) {
      updateData.subjectsNeeded = dto.subjectsNeeded.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updated = await this.model
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('subjectsNeeded', 'name')
      .lean();
    return updated;
  }
}
