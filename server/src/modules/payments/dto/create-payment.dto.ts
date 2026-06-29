import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsMongoId()
  bookingId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsNotEmpty()
  @IsEnum(['cash', 'bank_transfer', 'momo', 'vnpay', 'paypal'])
  method: 'cash' | 'bank_transfer' | 'momo' | 'vnpay' | 'paypal';

  @IsOptional()
  @IsEnum(['pending', 'paid', 'failed', 'refunded', 'cancelled'])
  status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

  @IsOptional()
  @IsString()
  note?: string;
}
