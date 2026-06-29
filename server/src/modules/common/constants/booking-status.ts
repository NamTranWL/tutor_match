export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'active',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
