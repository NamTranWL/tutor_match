import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StudentProfile,
  StudentProfileSchema,
} from './schemas/student-profile.schema';
import { StudentProfileService } from './student-profile.service';
import { StudentProfileController } from './student-profile.controller';
import {
  ParentProfile,
  ParentProfileSchema,
} from '@/modules/parent-profile/schemas/parent-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
    ]),
  ],
  controllers: [StudentProfileController],
  providers: [StudentProfileService],
  exports: [StudentProfileService],
})
export class StudentProfileModule {}
