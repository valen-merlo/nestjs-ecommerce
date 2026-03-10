import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from 'src/events/event-bus.service';
import { DomainEvents } from 'src/events/events.constants';
import type {
  ProductCreatedPayload,
  ProductActivatedPayload,
} from 'src/events/product.events';
import { ActivityService } from './activity.service';

@Injectable()
export class ActivityRecorderService implements OnModuleInit {
  private readonly logger = new Logger(ActivityRecorderService.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly activityService: ActivityService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(
      DomainEvents.PRODUCT_CREATED,
      async (payload: ProductCreatedPayload) => {
        try {
          await this.activityService.push(DomainEvents.PRODUCT_CREATED, payload);
        } catch (err) {
          this.logger.error(
            `[ActivityRecorder] PRODUCT_CREATED error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      },
    );
    this.eventBus.on(
      DomainEvents.PRODUCT_ACTIVATED,
      async (payload: ProductActivatedPayload) => {
        try {
          await this.activityService.push(DomainEvents.PRODUCT_ACTIVATED, payload);
        } catch (err) {
          this.logger.error(
            `[ActivityRecorder] PRODUCT_ACTIVATED error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      },
    );
  }
}
