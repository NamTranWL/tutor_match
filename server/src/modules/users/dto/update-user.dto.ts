import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsIn(['male', 'female', 'other']) gender?:
    | 'male'
    | 'female'
    | 'other';
  @IsOptional() @IsString() phone?: string;

  @IsOptional()
  @Transform(({ value }) =>
    ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase()),
  )
  @IsBoolean()
  isDeleted?: boolean;
}
