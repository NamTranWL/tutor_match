import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestBookingService } from '../requestBooking.service';
import type { RequestBookingDoc } from '../../../types/api/requestBooking';

export function useCreateRequestBookingsMutation() {
  const qc = useQueryClient();
  return useMutation<Array<{ _id: string; status: RequestBookingDoc['status'] }>, any, { tutorIds: string[]; studentId: string; requestedDate: string; note?: string }>({
    mutationFn: (body) => requestBookingService.createMany(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-request-bookings'] });
    },
  });
}

export function useCancelRequestBookingMutation() {
  const qc = useQueryClient();
  return useMutation<RequestBookingDoc, any, { id: string }>({
    mutationFn: ({ id }) => requestBookingService.cancelMine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-request-bookings'] });
    },
  });
}
