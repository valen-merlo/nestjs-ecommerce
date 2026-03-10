import { apiPost } from './client';
import type { LoginResponse } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', { email, password });
}

export async function register(email: string, password: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/register', { email, password });
}
