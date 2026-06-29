export type PaymentMethod = 'cash' | 'bank_transfer' | 'momo' | 'vnpay' | 'paypal';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentBookingInfo {
  _id: string;
  status: string;
  requestedDate?: string | Date;
  amount: number;
  parent?: { userId: string; email?: string; name?: string };
  tutor?: { userId: string; email?: string; name?: string };
}

export interface PaymentDoc {
  _id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt?: string;
  paidAt?: string;
  note?: string;
  booking?: PaymentBookingInfo;
}

export interface PaymentListQuery {
  current?: number;
  pageSize?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  bookingId?: string;
}

export interface PaymentListResponse {
  results: PaymentDoc[];
  totalPages: number;
}
