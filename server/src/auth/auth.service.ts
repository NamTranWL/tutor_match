import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswords } from '@/helpers/util';
import { SafeUser, LoginResult } from './auth.types';
import { Types } from 'mongoose';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailer: MailerService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  private buildActivationLink(code: string) {
    const base = (
      process.env.API_BASE_URL || 'http://localhost:8080/api/v1'
    ).replace(/\/?$/, '/');
    const url = new URL('auth/activate', base);
    url.searchParams.set('code', code);
    return url.toString();
  }

  async validateUser(email: string, password: string): Promise<SafeUser> {
    const doc = await this.usersService.findByEmail(email, true);
    if (!doc) throw new UnauthorizedException('Invalid credentials');

    const raw: any = typeof doc.toObject === 'function' ? doc.toObject() : doc;
    const hash: string | undefined = raw.password ?? raw.passwordHash;
    if (!hash) throw new UnauthorizedException('Invalid credentials');

    const ok = await comparePasswords(password, hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const safe: SafeUser = {
      _id: (raw._id as Types.ObjectId).toString(),
      email: raw.email,
      role: raw.role,
      name: raw.name,
      avatar: raw.avatar,
      gender: raw.gender,
      phone: raw.phone,
    };
    return safe;
  }

  async login(user: SafeUser): Promise<LoginResult> {
    // ensure user is active before issuing token
    const dbUser = await this.userModel
      .findById(user._id)
      .select('isActive')
      .lean();
    if (dbUser && dbUser.isActive === false) {
      // account exists but not activated
      throw new BadRequestException('Tài khoản chưa kích hoạt');
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token, user };
  }

  async handleRegister(registerDto: CreateAuthDto): Promise<any> {
    return await this.usersService.handleRegister(registerDto);
  }
  async activateByCode(
    code: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    const user = await this.userModel.findOne({ codeID: code });
    if (!user) return { ok: false, reason: 'invalid_code' };

    if (!user.codeExpired || user.codeExpired < new Date()) {
      return { ok: false, reason: 'expired' };
    }

    user.isActive = true;
    user.codeID = undefined;
    user.codeExpired = undefined;
    user.activationResendCount = 0;
    user.lastActivationResendAt = undefined;
    await user.save();

    return { ok: true };
  }
  async resendActivationEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Email không tồn tại');
    if (user.isActive) throw new BadRequestException('Tài khoản đã kích hoạt');

    if (
      user.lastActivationResendAt &&
      dayjs().diff(user.lastActivationResendAt, 'minute') < 1
    ) {
      throw new BadRequestException('Vui lòng thử lại sau một phút');
    }

    user.codeID = crypto.randomUUID();
    user.codeExpired = dayjs().add(24, 'hour').toDate();
    user.activationResendCount = (user.activationResendCount ?? 0) + 1;
    user.lastActivationResendAt = new Date();
    await user.save();

    const link = this.buildActivationLink(user.codeID);
    await this.mailer.sendMail({
      to: user.email,
      subject: 'Kích hoạt tài khoản – TutorMatch',
      template: './register',
      context: {
        name: user.email.split('@')[0],
        activationCode: user.codeID,
        activationLink: link,
      },
    });

    return {
      message: 'Email was sent',
      expiresAt: user.codeExpired,
    };
  }
}
