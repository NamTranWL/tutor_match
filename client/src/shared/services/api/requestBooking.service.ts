import api from './axios';
import type { ApiResponse } from '../../types/api/common';
import type {
  RequestBookingListQuery,
  RequestBookingListResponse,
  AcceptRequestBookingBody,
  AcceptRequestBookingResult,
  RejectRequestBookingBody,
  RequestBookingDoc,
} from '../../types/api/requestBooking';

const adminBase = '/admin/request-bookings';
const base = '/request-bookings';

export const requestBookingService = {
  async listAdminRequestBookings(params: RequestBookingListQuery): Promise<RequestBookingListResponse> {
    const res = await api.get<ApiResponse<RequestBookingListResponse>>(adminBase, { params });
    return res.data.data;
  },
  async acceptAdminRequestBooking(id: string, body: AcceptRequestBookingBody): Promise<AcceptRequestBookingResult> {
    const res = await api.post<ApiResponse<AcceptRequestBookingResult>>(`${adminBase}/${id}/accept`, body);
    return res.data.data;
  },
  async rejectAdminRequestBooking(id: string, body: RejectRequestBookingBody): Promise<RequestBookingDoc> {
    const res = await api.post<ApiResponse<RequestBookingDoc>>(`${adminBase}/${id}/reject`, body);
    return res.data.data;
  },
  async listParentMine(params: RequestBookingListQuery): Promise<RequestBookingListResponse> {
    const res = await api.get<ApiResponse<RequestBookingListResponse>>(`${base}/my`, { params });
    return res.data.data;
  },
  async listTutorForMe(params: RequestBookingListQuery): Promise<RequestBookingListResponse> {
    const res = await api.get<ApiResponse<RequestBookingListResponse>>(`${base}/for-me`, { params });
    return res.data.data;
  },
  async createMany(body: { tutorIds: string[]; studentId: string; requestedDate: string; slotId?: string; note?: string }): Promise<Array<{ _id: string; status: RequestBookingDoc['status'] }>> {
    const res = await api.post<ApiResponse<Array<{ _id: string; status: RequestBookingDoc['status'] }>>>(base, body);
    return res.data.data;
  },
  async cancelMine(id: string): Promise<RequestBookingDoc> {
    const res = await api.post<ApiResponse<RequestBookingDoc>>(`${base}/${id}/cancel`, {});
    return res.data.data;
  },
};
