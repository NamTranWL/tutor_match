import { useQuery } from '@tanstack/react-query';
import { requestBookingService } from '../requestBooking.service';
import type { RequestBookingListQuery, RequestBookingListResponse } from '../../../types/api/requestBooking';

export function useParentRequestBookingsQuery(params: RequestBookingListQuery, options?: { enabled?: boolean }) {
  return useQuery<RequestBookingListResponse>({
    queryKey: ['parent-request-bookings', params],
    queryFn: () => requestBookingService.listParentMine(params),
    enabled: options?.enabled,
  });
}

export function useTutorRequestBookingsQuery(params: RequestBookingListQuery, options?: { enabled?: boolean }) {
  return useQuery<RequestBookingListResponse>({
    queryKey: ['tutor-request-bookings', params],
    queryFn: () => requestBookingService.listTutorForMe(params),
    enabled: options?.enabled,
  });
}
