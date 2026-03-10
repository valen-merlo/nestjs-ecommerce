import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../event-bus.service';
import { DomainEvents } from '../events.constants';
import { ProductActivatedPayload } from '../product.events';

@Injectable()
export class ProductActivatedHandler implements OnModuleInit {
  private readonly logger = new Logger(ProductActivatedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  onModuleInit(): void {
    this.eventBus.on(
      DomainEvents.PRODUCT_ACTIVATED,
      (payload: ProductActivatedPayload) => {
        try {
          this.handle(payload);
        } catch (err) {
          this.logger.error(
            `[ProductActivated] handler error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      },
    );
  }

  private handle(payload: ProductActivatedPayload): void {
    this.logger.log(
      `[ProductActivated] productId=${payload.productId} merchantId=${payload.merchantId}`,
    );
  }
}
