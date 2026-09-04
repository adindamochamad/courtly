import { apiRequest } from './client';
import { loginResponseSchema, type LoginResponse } from './schemas';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * Register a new account. The API returns an access token immediately,
 * so the user is signed in right after signing up — no extra login step.
 */
export function register(input: RegisterInput): Promise<LoginResponse> {
  return apiRequest('/v1/auth/register', loginResponseSchema, {
    method: 'POST',
    body: input,
    public: true,
  });
}

export function login(input: LoginInput): Promise<LoginResponse> {
  return apiRequest('/v1/auth/login', loginResponseSchema, {
    method: 'POST',
    body: input,
    public: true,
  });
}
