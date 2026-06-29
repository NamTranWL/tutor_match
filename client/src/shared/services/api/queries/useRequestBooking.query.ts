import { useQuery } from '@tanstack/react-query';
import { requestBookingService } from '../requestBooking.service';
import type { RequestBookingListQuery, RequestBookingListResponse } from '../../../types/api/requestBooking';

export function useAdminRequestBookingListQuery(params: RequestBookingListQuery) {
  return useQuery<RequestBookingListResponse, unknown>({
    queryKey: ['admin', 'request-bookings', params],
    queryFn: () => requestBookingService.listAdminRequestBookings(params),
  });
}
