export interface Product {
  id: number;
  code?: string | null;
  title?: string | null;
  variationType?: string | null;
  description?: string | null;
  about?: string[];
  details?: Record<string, unknown> | null;
  isActive: boolean;
  merchantId: number;
  categoryId: number;
  category?: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItemPayload {
  productId: number;
  merchantId: number;
  occurredAt: string;
  categoryId?: number;
  title?: string | null;
}

export interface ActivityItem {
  type: 'product.created' | 'product.activated';
  payload: ActivityItemPayload;
  at: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface Profile {
  id: number;
  email: string;
  roleIds: number[];
}

export interface Category {
  id: number;
  name: string;
}
