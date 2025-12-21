import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  parentProfileId?: string;

  @IsOptional()
  @IsString()
  tutorId?: string;

  @IsNotEmpty()
  @IsString()
  tutorProfileId?: string;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsOptional()
  @IsString()
  status?: string;
}
