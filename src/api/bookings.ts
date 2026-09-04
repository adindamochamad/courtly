import { apiRequest } from './client';
import {
  bookingListResponseSchema,
  bookingSchema,
  type Booking,
} from './schemas';

export type BookingStatusFilter = 'UPCOMING' | 'PAST' | 'CANCELLED';

export type CreateBookingInput = {
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
};

export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return apiRequest('/v1/bookings', bookingSchema, {
    method: 'POST',
    body: input,
  });
}

export function fetchBookings(status?: BookingStatusFilter) {
  return apiRequest('/v1/bookings', bookingListResponseSchema, {
    query: { status },
  });
}

export function fetchBookingDetail(bookingId: string): Promise<Booking> {
  return apiRequest(`/v1/bookings/${bookingId}`, bookingSchema);
}

export function cancelBooking(bookingId: string): Promise<Booking> {
  return apiRequest(`/v1/bookings/${bookingId}`, bookingSchema, {
    method: 'DELETE',
  });
}
