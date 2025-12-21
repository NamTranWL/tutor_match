import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  ParentProfile,
  ParentProfileSchema,
} from '../parent-profile/schemas/parent-profile.schema';
import {
  TutorProfile,
  TutorProfileSchema,
} from '../tutor/schemas/tutor-profile.schema';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: User.name, schema: UserSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      { name: TutorProfile.name, schema: TutorProfileSchema },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
