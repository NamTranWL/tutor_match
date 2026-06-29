import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../payments.service';
import type { PaymentDoc, PaymentMethod, PaymentStatus } from '@/shared/types/api/payments';

export function useCreatePaymentMutation() {
  const qc = useQueryClient();
  return useMutation<{ _id: string }, any, { bookingId: string; amount?: number; method: PaymentMethod; status?: PaymentStatus; note?: string}>({
    mutationFn: (body) => paymentsService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
    },
  });
}

export function useUpdatePaymentMutation() {
  const qc = useQueryClient();
  return useMutation<
    PaymentDoc,
    any,
    { id: string; body: { amount?: number; method?: PaymentMethod; status?: PaymentStatus; note?: string } }
  >({
    mutationFn: ({ id, body }) => paymentsService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
    },
  });
}
