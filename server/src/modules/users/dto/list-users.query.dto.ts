import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsEnum, IsString } from 'class-validator';

export class ListUsersQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  })
  @IsInt()
  @Min(1)
  current?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const n = parseInt(String(value), 10);
    const v = Number.isFinite(n) && n >= 1 ? n : 10;
    return Math.min(100, v);
  })
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @Transform(({ value }) => {
    const v = String(value ?? '').trim();
    return v.length ? v : undefined;
  })
  @IsString()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const v = String(value ?? '').trim();
    return v.length ? v : undefined;
  })
  @IsEnum(['parent', 'tutor', 'admin'], {
    message: 'role must be one of parent, tutor, admin',
  })
  role?: 'parent' | 'tutor' | 'admin';

  @IsOptional()
  @Transform(({ value }) => {
    const v = String(value ?? '').trim();
    return v.length ? v : undefined;
  })
  @IsEnum(['active', 'banned', 'pending'], {
    message: 'status must be one of active, banned, pending',
  })
  status?: 'active' | 'banned' | 'pending';
}
