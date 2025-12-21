import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../booking.service';
import { bookingKeys } from '../queryKeys';
import type { BookingListQuery } from '../../../types/api/booking';

export function useBookingListQuery(params: BookingListQuery) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingService.getBookings(params),
  });
}
