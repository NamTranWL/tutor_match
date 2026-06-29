import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ThrottlerModule } from '@nestjs/throttler';
import { minutes } from '@nestjs/throttler';
import { RolesGuard } from './modules/common/guards/roles.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import { TutorProfileModule } from '@/modules/tutor/tutor-profile.module';
import { BookingsModule } from '@/modules/bookings/bookings.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { ReviewsModule } from '@/modules/reviews/reviews.module';
import { ParentProfileModule } from '@/modules/parent-profile/parent-profile.module';
import { StudentProfileModule } from '@/modules/student-profile/student-profile.module';
import { RequestBookingModule } from '@/modules/request-booking/request-booking.module';
import { AdminDashboardModule } from '@/modules/admin-dashboard/admin-dashboard.module';
import { TutorScheduleModule } from '@/modules/tutor-schedule/tutor-schedule.module';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: process.env.HOST_MAIL,
          port: 465,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: Joi.object({
        PORT: Joi.number().default(8080),
        MONGODB_URI: Joi.string().uri().required(),
        MONGODB_DBNAME: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: config.get<string>('MONGODB_DBNAME'),
      }),
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: minutes(1), limit: 10 }]),
    AuthModule,
    UsersModule,
    TutorProfileModule,
    ParentProfileModule,
    StudentProfileModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    RequestBookingModule,
    AdminDashboardModule,
    TutorScheduleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_GUARD, useClass: RolesGuard },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
