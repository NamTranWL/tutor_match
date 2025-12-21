import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ParentProfile,
  ParentProfileSchema,
} from './schemas/parent-profile.schema';
import { ParentProfileService } from './parent-profile.service';
import { ParentProfileController } from './parent-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParentProfile.name, schema: ParentProfileSchema },
    ]),
  ],
  controllers: [ParentProfileController],
  providers: [ParentProfileService],
  exports: [ParentProfileService],
})
export class ParentProfileModule {}
