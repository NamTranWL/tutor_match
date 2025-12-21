import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsString()
  method: string;

  @IsString()
  status?: string;
}
