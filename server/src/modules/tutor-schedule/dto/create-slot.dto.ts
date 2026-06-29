import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateSlotDto {
  /** ISO date string, e.g. "2025-07-14" */
  @IsDateString()
  date: string;

  @IsInt()
  @Min(0)
  @Max(23)
  startHour: number;

  @IsInt()
  @Min(1)
  @Max(24)
  endHour: number;

  @IsOptional()
  @IsEnum(['available', 'blocked'])
  status?: 'available' | 'blocked';

  @IsOptional()
  @IsString()
  note?: string;
}
