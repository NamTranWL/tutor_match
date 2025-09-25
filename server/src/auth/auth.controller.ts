import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  BadRequestException,
  Redirect,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '../decorator/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Throttle, ThrottlerGuard, minutes, hours } from '@nestjs/throttler';
import { UseGuards as Guards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  async login(@Request() req) {
    return this.authService.login(req.user); // req.user: SafeUser
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }

  // http://localhost:8080/api/auth/activate?code=xxxx

  @Get('activate')
  @Public()
  @Redirect(undefined, 302)
  async activate(@Query('code') code: string) {
    const { ok, reason } = await this.authService.activateByCode(code);
    const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
    const path = process.env.ACTIVATION_REDIRECT_PATH || '/activate-result';

    const target = new URL(path, frontend);
    target.searchParams.set('status', ok ? 'success' : 'failed');
    if (!ok && reason) target.searchParams.set('reason', reason);

    // Nest sẽ set Location và 302 dựa trên object return
    return { url: target.toString() };
  }

  @Public()
  @Guards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: minutes(1) } })
  @Post('resend-activation')
  async resendActivation(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.resendActivationEmail(email);
  }
}
