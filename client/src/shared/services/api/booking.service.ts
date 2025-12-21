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
  async updateBooking(id: string, body: Partial<CreateBookingBody>): Promise<BookingDoc> {
    const res = await api.patch<ApiResponse<BookingDoc>>(`${base}/${id}`, body);
    return res.data.data;
  },
};
