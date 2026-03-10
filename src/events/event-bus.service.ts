import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { DomainEventName } from './events.constants';
import type { DomainEventMap } from './events.types';

const DEFAULT_MAX_LISTENERS = 20;

@Injectable()
export class EventBusService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(DEFAULT_MAX_LISTENERS);
  }

  emitEvent<K extends DomainEventName>(name: K, payload: DomainEventMap[K]): boolean {
    return this.emit(name, payload);
  }
}
