export interface ProductCreatedPayload {
  productId: number;
  merchantId: number;
  categoryId: number;
  title?: string | null;
  occurredAt: Date;
}

export interface ProductActivatedPayload {
  productId: number;
  merchantId: number;
  occurredAt: Date;
}
