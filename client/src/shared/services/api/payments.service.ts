import api from './axios';
import type { ApiResponse } from '@/shared/types/api/common';
import type { PaymentDoc, PaymentListQuery, PaymentListResponse, PaymentMethod, PaymentStatus } from '@/shared/types/api/payments';

const base = '/admin/payments';

export const paymentsService = {
  async listAdmin(query: PaymentListQuery): Promise<PaymentListResponse> {
    const res = await api.get<ApiResponse<PaymentListResponse>>(base, { params: query });
    return res.data.data;
  },
  async create(body: { bookingId: string; amount?: number; method: PaymentMethod; status?: PaymentStatus; note?: string }): Promise<{ _id: string }> {
    const res = await api.post<ApiResponse<{ _id: string }>>(base, body);
    return res.data.data;
  },
  async update(id: string, body: { amount?: number; method?: PaymentMethod; status?: PaymentStatus; note?: string }): Promise<PaymentDoc> {
    const res = await api.patch<ApiResponse<PaymentDoc>>(`${base}/${id}`, body);
    return res.data.data;
  },
};
