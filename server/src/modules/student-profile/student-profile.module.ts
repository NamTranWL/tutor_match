import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StudentProfile,
  StudentProfileSchema,
} from './schemas/student-profile.schema';
import { StudentProfileService } from './student-profile.service';
import { StudentProfileController } from './student-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentProfile.name, schema: StudentProfileSchema },
    ]),
  ],
  controllers: [StudentProfileController],
  providers: [StudentProfileService],
  exports: [StudentProfileService],
})
export class StudentProfileModule {}
