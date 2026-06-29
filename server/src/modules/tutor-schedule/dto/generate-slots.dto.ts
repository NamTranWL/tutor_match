import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Generate slots for a date range based on tutorProfile.weeklyAvailability.
 * Tutor calls POST /tutor-schedule/generate with fromDate + toDate.
 * The service expands each weeklyAvailability entry into concrete slots.
 */
export class GenerateSlotsDto {
  /** e.g. "2025-07-14" */
  @IsDateString()
  fromDate: string;

  /** e.g. "2025-07-20" — must be >= fromDate, max 60 days span */
  @IsDateString()
  toDate: string;

  /** Limit span to avoid accidental bulk inserts (default 60) */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  maxDays?: number;
}
