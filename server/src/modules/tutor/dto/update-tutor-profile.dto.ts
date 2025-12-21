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
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateTutorProfileDto } from './create-tutor-profile.dto';

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
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDate()
  nextAvailableAt?: Date;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object) // hoặc thay bằng DTO con nếu bạn muốn strict hơn
  experience?: any[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  certificates?: any[];
}
