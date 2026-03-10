import { apiGet, apiPost } from './client';
import type { Product } from './types';

export function getProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/product');
}

export function getProduct(id: number): Promise<Product> {
  return apiGet<Product>(`/product/${id}`);
}

export function createProduct(
  body: {
    categoryId: number;
    title?: string;
    code?: string;
    description?: string;
    about?: string[];
    variationType?: string;
  },
  token: string,
): Promise<Product> {
  return apiPost<Product>('/product/create', body, token);
}

export function activateProduct(productId: number, token: string): Promise<{ id: number; isActive: boolean }> {
  return apiPost(`/product/${productId}/activate`, {}, token) as Promise<{ id: number; isActive: boolean }>;
}

export function deactivateProduct(productId: number, token: string): Promise<{ id: number; isActive: boolean }> {
  return apiPost(`/product/${productId}/deactivate`, {}, token) as Promise<{ id: number; isActive: boolean }>;
}

export function addProductDetails(
  productId: number,
  body: { description?: string; about?: string[]; title?: string; code?: string; variationType?: string },
  token: string,
): Promise<unknown> {
  return apiPost(`/product/${productId}/details`, body, token);
}
