import { PartialType, OmitType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateTutorProfileDto,
  WeeklyAvailabilitySlotDto,
} from './create-tutor-profile.dto';

export class UpdateTutorProfileDto extends OmitType(
  PartialType(CreateTutorProfileDto),
  ['userId'] as const,
) {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsExp?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teachingStyles?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(['online', 'offline', 'hybrid'])
  mode?: 'online' | 'offline' | 'hybrid';

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyAvailabilitySlotDto)
  weeklyAvailability?: WeeklyAvailabilitySlotDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  experience?: any[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  certificates?: any[];
}
