export type RequestBookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';

export interface RequestBookingDoc {
  _id: string;
  parentProfileId: string | { _id: string };
  tutorProfileId: string | { _id: string };
  studentId: string | { _id?: string };
  requestedDate: string;
  note?: string;
  status: RequestBookingStatus;
  adminId?: string;
  bookingId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Optional enriched fields from backend list endpoints
  parent?: { userId: string; email?: string; name?: string };
  tutor?: { userId: string; email?: string; name?: string };
  student?: { name?: string };
}

export interface RequestBookingListQuery {
  current?: number;
  pageSize?: number;
  status?: RequestBookingStatus;
  [key: string]: unknown;
}

export interface RequestBookingListResponse {
  results: RequestBookingDoc[];
  totalPages: number;
}

export interface AcceptRequestBookingBody {
  amount: number;
  bookingStatus?: 'active' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface AcceptRequestBookingResult {
  bookingId: string;
  request: RequestBookingDoc;
  paymentId?: string;
}

export interface RejectRequestBookingBody {
  reason?: string;
}
