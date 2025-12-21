import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationQueryDto {
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
}
