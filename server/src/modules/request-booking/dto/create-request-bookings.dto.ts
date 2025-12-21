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

  // Align with Booking's date field
  @IsDateString()
  requestedDate: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}
