import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsEnum(['parent', 'tutor', 'admin'])
  @IsOptional()
  role?: 'parent' | 'tutor' | 'admin';
}
