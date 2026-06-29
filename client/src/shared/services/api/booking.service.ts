import api from './axios';
import type { ApiResponse } from '../../types/api/common';
import type { BookingDoc, BookingListQuery, BookingListResponse, CreateBookingBody, CreateBookingResult } from '../../types/api/booking';

const base = '/bookings';

export const bookingService = {
  async createBooking(body: CreateBookingBody): Promise<CreateBookingResult> {
    const res = await api.post<ApiResponse<CreateBookingResult>>(base, body);
    return res.data.data;
  },
  async getBookings(params: BookingListQuery): Promise<BookingListResponse> {
    const res = await api.get<ApiResponse<BookingListResponse>>(base, { params });
    return res.data.data;
  },
  async getBookingStats(params: BookingListQuery): Promise<{ totalAmount: number, count: number }> {
    const res = await api.get<ApiResponse<{ totalAmount: number, count: number }>>(`${base}/stats`, { params });
    return res.data.data;
  },
  async updateBooking(id: string, body: Partial<CreateBookingBody>): Promise<BookingDoc> {
    const res = await api.patch<ApiResponse<BookingDoc>>(`${base}/${id}`, body);
    return res.data.data;
  },
  async deleteBooking(id: string): Promise<{ deleted: boolean; id: string }> {
    const res = await api.delete<ApiResponse<{ deleted: boolean; id: string }>>(`${base}/${id}`);
    return res.data.data;
  },
};
