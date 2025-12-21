import { PartialType } from '@nestjs/mapped-types';
import { CreateParentProfileDto } from './create-parent-profile.dto';

export class UpdateParentProfileDto extends PartialType(
  CreateParentProfileDto,
) {}
