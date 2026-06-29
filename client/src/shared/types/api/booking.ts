export interface BookingDoc {
  _id: string;
  parentProfileId: string | { _id: string };
  tutorProfileId: string | { _id: string };
  studentId: string | { _id?: string };
  date: string;
  amount: number;
  status: string;
  parent?: { userId: string; email?: string; name?: string };
  tutor?: { userId: string; email?: string; name?: string };
  student?: { name?: string };
}

export interface CreateBookingBody {
  parentId?: string;
  parentProfileId?: string;
  tutorId?: string;
  tutorProfileId?: string;
  date: string;
  amount: number;
  studentId: string;
  status?: string;
}

export interface CreateBookingResult {
  _id: string;
}

export interface BookingListQuery {
  current?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface BookingListResponse {
  results: BookingDoc[];
  totalPages: number;
}
