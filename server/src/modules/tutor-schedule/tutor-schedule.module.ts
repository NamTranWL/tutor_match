import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TutorScheduleSlot,
  TutorScheduleSlotSchema,
} from './schemas/tutor-schedule-slot.schema';
import {
  TutorProfile,
  TutorProfileSchema,
} from '@/modules/tutor/schemas/tutor-profile.schema';
import { User, UserSchema } from '@/modules/users/schemas/user.schema';
import { TutorScheduleService } from './tutor-schedule.service';
import { TutorScheduleController } from './tutor-schedule.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TutorScheduleSlot.name, schema: TutorScheduleSlotSchema },
      { name: TutorProfile.name, schema: TutorProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TutorScheduleController],
  providers: [TutorScheduleService],
  exports: [TutorScheduleService],
})
export class TutorScheduleModule {}
