import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSlotDto {
  @IsOptional()
  @IsEnum(['available', 'blocked'])
  status?: 'available' | 'blocked';

  @IsOptional()
  @IsString()
  note?: string;
}
