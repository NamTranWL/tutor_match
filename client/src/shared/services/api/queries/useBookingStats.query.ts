import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../booking.service';
import { bookingKeys } from '../queryKeys';
import type { BookingListQuery } from '../../../types/api/booking';

export function useBookingStats(params: BookingListQuery) {
  return useQuery({
    queryKey: [...bookingKeys.all, 'stats', params],
    queryFn: () => bookingService.getBookingStats(params),
  });
}
