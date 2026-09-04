import { apiRequest } from './client';
import { availabilityResponseSchema } from './schemas';

export function fetchAvailability(facilityId: string, date: string) {
  return apiRequest(
    `/v1/facilities/${facilityId}/availability`,
    availabilityResponseSchema,
    { query: { date }, public: true },
  );
}
