export const DomainEvents = {
  PRODUCT_CREATED: 'product.created',
  PRODUCT_ACTIVATED: 'product.activated',
} as const;

export type DomainEventName =
  (typeof DomainEvents)[keyof typeof DomainEvents];
