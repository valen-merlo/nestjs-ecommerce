import { Global, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';
import { ProductCreatedHandler } from './handlers/product-created.handler';
import { ProductActivatedHandler } from './handlers/product-activated.handler';
import { ProductActivatedInventoryHandler } from './handlers/product-activated-inventory.handler';

@Global()
@Module({
  providers: [
    EventBusService,
    ProductCreatedHandler,
    ProductActivatedHandler,
    ProductActivatedInventoryHandler,
  ],
  exports: [EventBusService],
})
export class EventsModule {}
