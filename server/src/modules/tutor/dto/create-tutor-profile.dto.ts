import {
  IsArray,
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export type TeachingMode = 'online' | 'offline' | 'hybrid';

export class SubjectLevelDto {
  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsString()
  level?: string;
}

export class LocationDto {
  @IsEnum(['Point'])
  type: 'Point' = 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates!: [number, number];
}

export class ExperienceItemDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  org?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDate()
  from?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDate()
  to?: Date;
}

export class CertificateItemDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

export class CreateTutorProfileDto {
  @IsMongoId()
  userId!: string;

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

  @ValidateNested({ each: true })
  @Type(() => SubjectLevelDto)
  @IsArray()
  subjects!: SubjectLevelDto[];

  @IsNumber()
  @Min(0)
  hourlyRate!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsEnum(['online', 'offline', 'hybrid'])
  mode?: TeachingMode;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsDate()
  nextAvailableAt?: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experience?: ExperienceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateItemDto)
  certificates?: CertificateItemDto[];
}
