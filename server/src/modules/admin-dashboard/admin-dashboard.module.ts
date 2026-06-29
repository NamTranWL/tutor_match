import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  Booking,
  BookingSchema,
} from '@/modules/bookings/schemas/booking.schema';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import {
  ParentProfile,
  ParentProfileSchema,
} from '@/modules/parent-profile/schemas/parent-profile.schema';
import {
  TutorProfile,
  TutorProfileSchema,
} from '@/modules/tutor/schemas/tutor-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      { name: TutorProfile.name, schema: TutorProfileSchema },
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
