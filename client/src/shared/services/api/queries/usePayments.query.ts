import { useQuery } from '@tanstack/react-query';
import { paymentsService } from '../payments.service';
import type { PaymentListQuery, PaymentListResponse } from '@/shared/types/api/payments';

export function useAdminPaymentsQuery(params: PaymentListQuery) {
  return useQuery<PaymentListResponse>({
    queryKey: ['admin-payments', params],
    queryFn: () => paymentsService.listAdmin(params),
  });
}
