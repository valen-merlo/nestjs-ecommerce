import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { EventBusService } from '../event-bus.service';
import { DomainEvents } from '../events.constants';
import { ProductActivatedPayload } from '../product.events';
import { Product } from 'src/database/entities/product.entity';
import { ProductVariation } from 'src/database/entities/productVariation.entity';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Size } from 'src/database/entities/size.entity';
import { Color } from 'src/database/entities/color.entity';
import { Country } from 'src/database/entities/country.entity';
import { SizeCodes } from 'src/database/entities/size.entity';
import { Colors } from 'src/database/entities/color.entity';
import { CountryCodes } from 'src/database/entities/country.entity';

const DEFAULT_SIZE = SizeCodes.NA;
const DEFAULT_COLOR = Colors.NA;
const DEFAULT_COUNTRY = CountryCodes.Egypt;
const INITIAL_QUANTITY = 0;

@Injectable()
export class ProductActivatedInventoryHandler implements OnModuleInit {
  private readonly logger = new Logger(ProductActivatedInventoryHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    @InjectEntityManager()
    private readonly em: EntityManager,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(
      DomainEvents.PRODUCT_ACTIVATED,
      (payload: ProductActivatedPayload) => {
        this.handle(payload).catch((err) => {
          this.logger.error(
            `[ProductActivatedInventory] error: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
      },
    );
  }

  private async handle(payload: ProductActivatedPayload): Promise<void> {
    const { productId } = payload;

    const product = await this.em.findOne(Product, { where: { id: productId } });
    if (!product) {
      this.logger.warn(`[ProductActivatedInventory] product ${productId} not found, skip`);
      return;
    }

    const size = await this.em.findOne(Size, { where: { code: DEFAULT_SIZE } });
    const color = await this.em.findOne(Color, { where: { name: DEFAULT_COLOR } });
    const country = await this.em.findOne(Country, { where: { code: DEFAULT_COUNTRY } });
    if (!size || !color || !country) {
      this.logger.warn(
        `[ProductActivatedInventory] missing seed data (size/color/country), skip product ${productId}`,
      );
      return;
    }

    let variation = await this.em.findOne(ProductVariation, {
      where: { productId, sizeCode: DEFAULT_SIZE, colorName: DEFAULT_COLOR },
    });
    if (!variation) {
      variation = this.em.create(ProductVariation, {
        productId,
        sizeCode: DEFAULT_SIZE,
        colorName: DEFAULT_COLOR,
        imageUrls: [],
      });
      variation = await this.em.save(variation);
      this.logger.log(
        `[ProductActivatedInventory] created variation ${variation.id} for product ${productId}`,
      );
    }

    const existingInventory = await this.em.findOne(Inventory, {
      where: { productVariationId: variation.id, countryCode: DEFAULT_COUNTRY },
    });
    if (!existingInventory) {
      const inventory = this.em.create(Inventory, {
        productVariationId: variation.id,
        countryCode: DEFAULT_COUNTRY,
        quantity: INITIAL_QUANTITY,
      });
      await this.em.save(inventory);
      this.logger.log(
        `[ProductActivatedInventory] created inventory for variation ${variation.id}, country ${DEFAULT_COUNTRY}, product ${productId}`,
      );
    }
  }
}
