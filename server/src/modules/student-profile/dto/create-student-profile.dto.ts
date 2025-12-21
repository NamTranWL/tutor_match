import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentProfileDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  parentId: string;

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
}
