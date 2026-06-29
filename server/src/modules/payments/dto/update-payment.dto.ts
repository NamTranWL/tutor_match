import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentDto {
	@IsOptional()
	@IsNumber()
	amount?: number;

	@IsOptional()
	@IsEnum(['cash', 'bank_transfer', 'momo', 'vnpay', 'paypal'])
	method?: 'cash' | 'bank_transfer' | 'momo' | 'vnpay' | 'paypal';

	@IsOptional()
	@IsEnum(['pending', 'paid', 'failed', 'refunded', 'cancelled'])
	status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

	@IsOptional()
	@IsString()
	note?: string;
}
