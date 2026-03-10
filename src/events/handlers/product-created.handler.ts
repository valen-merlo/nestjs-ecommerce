import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { DomainEvents } from '../events.constants';
import { ProductCreatedPayload } from '../product.events';

@Injectable()
export class ProductCreatedHandler implements OnModuleInit {
  private readonly logger = new Logger(ProductCreatedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit(): void {
    this.eventBus.on(
      DomainEvents.PRODUCT_CREATED,
      (payload: ProductCreatedPayload) => {
        try {
          this.handle(payload);
        } catch (err) {
          this.logger.error(
            `[ProductCreated] handler error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      },
    );
  }

  private handle(payload: ProductCreatedPayload): void {
    this.logger.log(
      `[ProductCreated] productId=${payload.productId} merchantId=${payload.merchantId} categoryId=${payload.categoryId} title=${payload.title ?? '(sin título)'}`,
    );
  }
}
