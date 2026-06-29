import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../booking.service';
import { useParentProfileByUser, useTutorProfileByUser } from './useProfile.query';
import type { BookingListQuery, BookingListResponse } from '../../../shared/types/api/booking';

export function useParentBookingsQuery(userId: string | undefined, params: BookingListQuery) {
  const profile = useParentProfileByUser(userId);
  return useQuery<BookingListResponse>({
    queryKey: ['parent-bookings', userId, params],
    queryFn: () => bookingService.getBookings({ ...params, parentProfileId: (profile.data as any)?._id }),
    enabled: !!userId && !!profile.data,
  });
}

export function useTutorBookingsQuery(userId: string | undefined, params: BookingListQuery) {
  const profile = useTutorProfileByUser(userId);
  return useQuery<BookingListResponse>({
    queryKey: ['tutor-bookings', userId, params],
    queryFn: () => bookingService.getBookings({ ...params, tutorProfileId: (profile.data as any)?._id }),
    enabled: !!userId && !!profile.data,
  });
}
