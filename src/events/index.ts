export { DomainEvents, type DomainEventName } from './events.constants';
export type { DomainEventMap, DomainEventPayload } from './events.types';
export type {
  ProductCreatedPayload,
  ProductActivatedPayload,
} from './product.events';
export { EventBusService } from './event-bus.service';
export { EventsModule } from './events.module';
