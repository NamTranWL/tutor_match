import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StudentProfile,
  StudentProfileDocument,
} from './schemas/student-profile.schema';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class StudentProfileService {
  constructor(
    @InjectModel(StudentProfile.name)
    private model: Model<StudentProfileDocument>,
  ) {}

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
      });
      return { _id: doc._id };
    } catch (err: any) {
      throw new InternalServerErrorException('Create student profile failed');
    }
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException('Student not found');
    return doc;
  }

  async findByParentId(parentId: string) {
    return this.model.find({ parentId: new Types.ObjectId(parentId) }).lean();
  }

  async update(id: string, dto: UpdateStudentProfileDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto as any, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException('Student not found');
    return updated;
  }
}
