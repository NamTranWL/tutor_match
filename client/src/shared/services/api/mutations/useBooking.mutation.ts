import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../booking.service';
import { bookingKeys } from '../queryKeys';
import type { CreateBookingBody, CreateBookingResult } from '../../../types/api/booking';

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBookingBody) => bookingService.createBooking(body),
    onSuccess: (_data: CreateBookingResult) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useUpdateBookingMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CreateBookingBody>) => bookingService.updateBooking(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
