import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RequestBooking,
  RequestBookingSchema,
} from './schemas/request-booking.schema';
import { RequestBookingService } from './request-booking.service';
import { RequestBookingController } from './request-booking.controller';
import { RequestBookingAdminController } from './request-booking.admin.controller';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import {
  ParentProfile,
  ParentProfileSchema,
} from '@/modules/parent-profile/schemas/parent-profile.schema';
import {
  TutorProfile,
  TutorProfileSchema,
} from '@/modules/tutor/schemas/tutor-profile.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '@/modules/student-profile/schemas/student-profile.schema';
import { BookingsModule } from '@/modules/bookings/bookings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestBooking.name, schema: RequestBookingSchema },
      { name: User.name, schema: UserSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      { name: TutorProfile.name, schema: TutorProfileSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
    ]),
    BookingsModule,
  ],
  controllers: [RequestBookingController, RequestBookingAdminController],
  providers: [RequestBookingService],
})
export class RequestBookingModule {}
