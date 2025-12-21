import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';
import {
  BOOKING_STATUSES,
  BookingStatus,
} from '../../common/constants/booking-status';

export class AcceptRequestBookingDto {
  @IsNumber()
  @Min(0)
  amount: number;

  // Optional override booking status (defaults to 'pending' in Booking)
  @IsOptional()
  @IsIn(BOOKING_STATUSES)
  bookingStatus?: BookingStatus;
}
