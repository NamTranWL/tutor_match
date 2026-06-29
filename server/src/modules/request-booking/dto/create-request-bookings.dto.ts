import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateRequestBookingsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  tutorIds: string[];

  @IsMongoId()
  studentId: string;

  @IsDateString()
  requestedDate: string;

  /**
   * Optional: ID of the TutorScheduleSlot the parent selected.
   * When provided, the system validates the slot is 'available' and
   * belongs to the tutor. Only applicable when tutorIds has exactly 1 entry.
   */
  @IsOptional()
  @IsMongoId()
  slotId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}
