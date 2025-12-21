import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateParentProfileDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
