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
import { hashPasswordHelper } from '@/helpers/util';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailerService: MailerService,
  ) {}
  private escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  private buildActivationLink(code: string) {
    const base = process.env.API_BASE_URL.replace(/\/?$/, '/');
    const url = new URL('auth/activate', base);
    url.searchParams.set('code', code);
    return url.toString();
  }

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

  async handleRegister(registerDto: CreateAuthDto) {
    const { v4: uuidv4 } = await import('uuid');
    const emailExist = await this.isEmailExists(registerDto.email);
    if (emailExist) {
      throw new BadRequestException(
        `Email ${registerDto.email} already exists`,
      );
    }

    //hash pash
    const hashedPassword = await hashPasswordHelper(registerDto.password);
    const codeID = uuidv4();
    const newUser = await this.userModel.create({
      email: registerDto.email,
      role: registerDto.role,
      name: registerDto.name,
      password: hashedPassword,
      codeID,
      codeExpired: dayjs().add(1, 'day').toDate(),
    });
    const link = this.buildActivationLink(newUser.codeID);
    this.mailerService.sendMail({
      to: newUser.email, // list of receivers
      subject: 'Welcome to TutorFinder! Please activate your account', // Subject line
      template: 'register',
      context: {
        name: newUser.email.split('@')[0],
        activationCode: newUser.codeID,
        activationLink: link,
      },
    });

    return {
      _id: newUser._id,
    };
  }

  async findAll(query: any) {
    try {
      const filter: Record<string, any> = {};
      // Exclude deleted by default
      filter.isDeleted = { $ne: true };

      if (query?.role) filter.role = String(query.role);
      if (query?.status) filter.status = String(query.status);
      if (query?.email) {
        const pattern = this.escapeRegex(String(query.email));
        filter.email = { $regex: pattern, $options: 'i' };
      }

      const currentRaw = Number(query?.current);
      const sizeRaw = Number(query?.pageSize);
      const current =
        Number.isFinite(currentRaw) && currentRaw >= 1 ? currentRaw : 1;
      const unclamped = Number.isFinite(sizeRaw) && sizeRaw >= 1 ? sizeRaw : 10;
      const pageSize = Math.min(100, unclamped);
      const skip = (current - 1) * pageSize;

      const results = await this.userModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort({ createdAt: -1 })
        .select('-password  ')
        .lean();
      const totalItems = await this.userModel.countDocuments(filter);
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

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

  async findByEmail(email: string, withPassword = false) {
    if (withPassword) {
      return await this.userModel.findOne({ email }).select('+password');
    }
    return await this.userModel.findOne({ email });
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
