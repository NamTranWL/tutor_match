import type { BookingDoc } from './booking'

export interface AdminOverview {
  tutors: number
  parents: number
  bookings: number
  revenue: number
  recentBookings: Array<Pick<BookingDoc, '_id' | 'parentProfileId' | 'tutorProfileId' | 'date' | 'amount' | 'status' | 'parent' | 'tutor'>>
}
