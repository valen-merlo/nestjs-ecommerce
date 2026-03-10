import { DomainEvents, DomainEventName } from './events.constants';
import type {
  ProductCreatedPayload,
  ProductActivatedPayload,
} from './product.events';

export interface DomainEventMap {
  [DomainEvents.PRODUCT_CREATED]: ProductCreatedPayload;
  [DomainEvents.PRODUCT_ACTIVATED]: ProductActivatedPayload;
}

export type DomainEventPayload<K extends DomainEventName> = DomainEventMap[K];
