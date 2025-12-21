import { IsOptional, IsString, Length } from 'class-validator';

export class RejectRequestBookingDto {
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}
