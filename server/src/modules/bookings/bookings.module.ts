import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import {
  ParentProfile,
  ParentProfileSchema,
} from '../parent-profile/schemas/parent-profile.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '../student-profile/schemas/student-profile.schema';
import {
  TutorProfile,
  TutorProfileSchema,
} from '../tutor/schemas/tutor-profile.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: TutorProfile.name, schema: TutorProfileSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
