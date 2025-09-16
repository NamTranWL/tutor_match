import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { SafeUser } from '../auth.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<SafeUser> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException();
    if (user.isActive === false) {
      throw new BadRequestException(
        'Your account is not activated. Please check your email to activate your account.',
      );
    }
    return user;
  }
}
