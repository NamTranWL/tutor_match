import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestBookingService } from '../requestBooking.service';
import type { AcceptRequestBookingBody, AcceptRequestBookingResult, RejectRequestBookingBody, RequestBookingDoc } from '../../../types/api/requestBooking';

export function useAcceptRequestBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation<AcceptRequestBookingResult, unknown, { id: string; body: AcceptRequestBookingBody }>({
    mutationFn: ({ id, body }) => requestBookingService.acceptAdminRequestBooking(id, body),
    onSuccess: () => {
      // Refresh lists after accept: new booking created + requests updated
      queryClient.invalidateQueries({ queryKey: ['admin', 'request-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useRejectRequestBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation<RequestBookingDoc, unknown, { id: string; body: RejectRequestBookingBody }>({
    mutationFn: ({ id, body }) => requestBookingService.rejectAdminRequestBooking(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'request-bookings'] });
    },
  });
}

export function useCreateRequestBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { tutorIds: string[]; studentId: string; requestedDate: string; slotId?: string; note?: string }) =>
      requestBookingService.createMany(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-schedule'] });
    },
  });
}

export function useCancelRequestBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestBookingService.cancelMine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-bookings'] });
    },
  });
}

