import { z } from 'zod';

/**
 * Zod schemas mirroring the Courtly API Swagger spec
 * (https://courtly-api.hyge.web.id/api/docs).
 *
 * Every API response is validated at runtime — if the backend
 * changes shape, we fail loudly during development instead of
 * rendering `undefined` in production.
 */

// ---------- Auth ----------

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

// ---------- Facilities ----------

export const facilitySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  distanceKm: z.number(),
  rating: z.number(),
  reviewCount: z.number(),
  sports: z.array(z.string()),
  startingPrice: z.number(),
  imageUrl: z.string(),
});

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const facilityListResponseSchema = z.object({
  data: z.array(facilitySummarySchema),
  pagination: paginationSchema,
});

export const courtSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['STANDARD', 'PANORAMIC', 'VIP', 'INDOOR', 'OUTDOOR']),
  indoor: z.boolean(),
  basePrice: z.number(),
  sport: z.string(),
});

export const facilityDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  address: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  imageUrl: z.string(),
  sports: z.array(z.string()),
  amenities: z.array(z.string()),
  courts: z.array(courtSummarySchema),
});

// ---------- Lookups ----------

export const sportsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
});

export const citiesResponseSchema = z.object({
  data: z.array(z.string()),
});

// ---------- Availability ----------

export const availabilitySlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  price: z.number(),
  available: z.boolean(),
});

export const availabilityResponseSchema = z.object({
  date: z.string(),
  courts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      indoor: z.boolean(),
      slots: z.array(availabilitySlotSchema),
    }),
  ),
});

// ---------- Bookings ----------

export const bookingSchema = z.object({
  id: z.string(),
  bookingReference: z.string(),
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED']),
  facility: z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string(),
  }),
  court: z.object({
    id: z.string(),
    name: z.string(),
  }),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  price: z.number(),
  serviceFee: z.number(),
  totalPrice: z.number(),
});

export const bookingListResponseSchema = z.object({
  data: z.array(bookingSchema),
});

// ---------- Inferred types ----------

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type FacilitySummary = z.infer<typeof facilitySummarySchema>;
export type FacilityDetail = z.infer<typeof facilityDetailSchema>;
export type CourtSummary = z.infer<typeof courtSummarySchema>;
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type SportOption = z.infer<typeof sportsResponseSchema>['data'][number];
