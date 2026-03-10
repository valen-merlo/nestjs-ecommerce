import { apiGet, apiPost } from './client';
import type { Category } from './types';

export function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/category');
}

export function createCategory(body: { id: number; name: string }, token: string): Promise<Category> {
  return apiPost<Category>('/category', body, token);
}
