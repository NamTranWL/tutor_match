import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswords } from '@/helpers/util';
import { SafeUser, LoginResult } from './auth.types';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
    const payload = { sub: user._id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token, user };
  }
}
