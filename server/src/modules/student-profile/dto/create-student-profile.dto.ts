import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsMongoId,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleSlotDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format (e.g., 14:30)',
  })
  start: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:mm format (e.g., 16:00)',
  })
  end: string;
}

export class WeekdayScheduleDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  weekday: number; // 0 = Sunday, 6 = Saturday

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleSlotDto)
  slots: ScheduleSlotDto[];
}

export class LocationDto {
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  district?: string;
}

export class BudgetRangeDto {
  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;
}

export class CreateStudentProfileDto {
  @IsOptional()
  @IsString()
  userId?: string;

  // parentId is auto-injected by backend from authenticated user session
  // Frontend should NOT send this field
  @IsOptional()
  @IsString()
  parentId?: string;

  // Basic fields
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  specialNeeds?: string;

  // Enhanced fields
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subjectsNeeded?: string[];

  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  learningGoals?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeekdayScheduleDto)
  schedulePreferences?: WeekdayScheduleDto[];

  @IsOptional()
  @IsEnum(['ONLINE', 'OFFLINE', 'HYBRID'])
  mode?: 'ONLINE' | 'OFFLINE' | 'HYBRID';

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetRangeDto)
  budgetRange?: BudgetRangeDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
