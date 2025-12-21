import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TutorProfile,
  TutorProfileSchema,
} from './schemas/tutor-profile.schema';
import { TutorProfileService } from './tutor-profile.service';
import { TutorProfileController } from './tutor-profile.controller';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TutorProfile.name, schema: TutorProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TutorProfileController],
  providers: [TutorProfileService],
  exports: [TutorProfileService],
})
export class TutorProfileModule {}
