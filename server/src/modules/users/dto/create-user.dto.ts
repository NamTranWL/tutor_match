import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus, Gender } from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(['parent', 'tutor', 'admin'])
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(['active', 'banned', 'pending'])
  @IsOptional()
  status?: UserStatus = 'active';
}
