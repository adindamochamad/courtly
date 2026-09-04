import { apiRequest } from './client';
import {
  citiesResponseSchema,
  facilityDetailSchema,
  facilityListResponseSchema,
  sportsResponseSchema,
} from './schemas';

export const FACILITIES_PAGE_SIZE = 10;

export type FacilityFilters = {
  search?: string;
  sport?: string;
  city?: string;
};

export function fetchFacilities(page: number, filters: FacilityFilters = {}) {
  return apiRequest('/v1/facilities', facilityListResponseSchema, {
    query: {
      page,
      limit: FACILITIES_PAGE_SIZE,
      search: filters.search,
      sport: filters.sport,
      city: filters.city,
    },
    public: true,
  });
}

export function fetchFacilityDetail(facilityId: string) {
  return apiRequest(`/v1/facilities/${facilityId}`, facilityDetailSchema, {
    public: true,
  });
}

export function fetchSports() {
  return apiRequest('/v1/sports', sportsResponseSchema, { public: true });
}

export function fetchCities() {
  return apiRequest('/v1/cities', citiesResponseSchema, { public: true });
}
