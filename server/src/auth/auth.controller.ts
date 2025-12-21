import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
  BadRequestException,
  Res,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '../decorator/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Throttle, ThrottlerGuard, minutes } from '@nestjs/throttler';
import { UseGuards as Guards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
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
  async activate(@Query('code') code: string, @Res() res: Response) {
    this.logger.log(`Activate request received, code=${code}`);

    const { ok, reason } = await this.authService.activateByCode(code);
    this.logger.log(
      `Activation result for code=${code}: ok=${ok}, reason=${reason}`,
    );

    const frontend = process.env.FRONTEND_ORIGIN;
    const path = process.env.ACTIVATION_REDIRECT_PATH;
    if (!frontend) {
      this.logger.error('Missing FRONTEND_ORIGIN environment variable');
      throw new InternalServerErrorException('FRONTEND_ORIGIN not configured');
    }
    if (!path) {
      this.logger.error(
        'Missing ACTIVATION_REDIRECT_PATH environment variable',
      );
      throw new InternalServerErrorException(
        'ACTIVATION_REDIRECT_PATH not configured',
      );
    }

    const target = new URL(path, frontend);
    target.searchParams.set('status', ok ? 'success' : 'failed');
    if (!ok && reason) target.searchParams.set('reason', reason);

    this.logger.log(`Redirecting to ${target.toString()}`);
    return res.redirect(302, target.toString());
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
