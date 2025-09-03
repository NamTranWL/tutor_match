import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPasswordHelper, comparePasswords } from '@/helpers/util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async isEmailExists(email: string): Promise<boolean> {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    //check email
    const emailExist = await this.isEmailExists(createUserDto.email);
    if (emailExist) {
      throw new BadRequestException(
        `Email ${createUserDto.email} already exists`,
      );
    }

    //hash pash
    const hashedPassword = await hashPasswordHelper(createUserDto.password);
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    await newUser.save();
    return {
      _id: newUser._id,
    };
  }

  async findAll(query: any) {
    try {
      // import ESM
      const { default: aqp } = await Function(
        'return import("api-query-params")',
      )();

      let { filter = {}, sort } = aqp(query || {});

      delete (filter as any).current;
      delete (filter as any).pageSize;
      delete (filter as any).password;
      delete (filter as any).withDeleted;
      delete (filter as any).onlyDeleted;

      // filter for deleted
      if ('isdeleted' in filter && !('isDeleted' in filter)) {
        (filter as any).isDeleted = (filter as any).isdeleted;
        delete (filter as any).isdeleted;
      }
      if (typeof (filter as any).isDeleted === 'string') {
        const v = String((filter as any).isDeleted).toLowerCase();
        (filter as any).isDeleted = ['true', '1', 'yes', 'on'].includes(v);
      }
      const includeDeleted = ['true', '1', 'yes'].includes(
        String(query?.withDeleted || '').toLowerCase(),
      );
      const onlyDeleted = ['true', '1', 'yes'].includes(
        String(query?.onlyDeleted || '').toLowerCase(),
      );

      if (!includeDeleted) {
        (filter as any).isDeleted = onlyDeleted ? true : { $ne: true };
      }

      // sizepage

      const current = Number(query?.current) > 0 ? Number(query.current) : 1;
      const pageSize =
        Number(query?.pageSize) > 0 ? Number(query.pageSize) : 10;
      const skip = (current - 1) * pageSize;

      const results = await this.userModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any)
        .select('-password  ')
        .lean();
      const totalItems = await this.userModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        results,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error(`findAll failed: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException(
        error?.message || 'findAll crashed',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, dto: UpdateUserDto) {
    const updated = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();

    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async softDelete(id: string) {
    const doc = await this.userModel
      .findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true, runValidators: true },
      )
      .lean();
    if (!doc) throw new NotFoundException('User not found');
    return doc; // trả về user sau khi đã gắn isDeleted=true
  }

  async hardDelete(id: string) {
    const res = await this.userModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) throw new NotFoundException('User not found');
    return { deleted: true, id };
  }
}
