import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateProductDto, ProductDetailsDto } from '../dto/product.dto';
import { Category } from '../../../database/entities/category.entity';
import { Product } from 'src/database/entities/product.entity';
import { errorMessages } from 'src/errors/custom';
import { successObject } from 'src/common/helper/success-response.interceptor';
import { EventBusService } from 'src/events/event-bus.service';
import { DomainEvents } from 'src/events/events.constants';
import type {
  ProductCreatedPayload,
  ProductActivatedPayload,
} from 'src/events/product.events';

@Injectable()
export class ProductService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly eventBus: EventBusService,
  ) {}

  async getProduct(productId: number) {
    const product = await this.entityManager.findOne(Product, {
      where: {
        id: productId,
      },
    });

    if (!product) throw new NotFoundException(errorMessages.product.notFound);

    return product;
  }

  async createProduct(data: CreateProductDto, merchantId: number) {
    const category = await this.entityManager.findOne(Category, {
      where: { id: data.categoryId },
    });

    if (!category) throw new NotFoundException(errorMessages.category.notFound);

    const product = this.entityManager.create(Product, {
      category,
      merchantId,
      ...(data.title != null && { title: data.title }),
      ...(data.code != null && { code: data.code }),
      ...(data.variationType != null && { variationType: data.variationType }),
      ...(data.details != null && { details: data.details }),
      ...(data.about != null && { about: data.about }),
      ...(data.description != null && { description: data.description }),
    });

    const saved = await this.entityManager.save(product);

    this.eventBus.emitEvent(DomainEvents.PRODUCT_CREATED, {
      productId: saved.id,
      merchantId,
      categoryId: data.categoryId,
      title: saved.title ?? null,
      occurredAt: new Date(),
    } satisfies ProductCreatedPayload);

    return saved;
  }

  async listProducts(): Promise<Product[]> {
    return this.entityManager.find(Product, {
      order: { createdAt: 'DESC' },
      relations: ['category'],
    });
  }

  async addProductDetails(
    productId: number,
    body: ProductDetailsDto,
    merchantId: number,
  ) {
    const set = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined),
    ) as Partial<Product>;
    if (Object.keys(set).length === 0)
      throw new BadRequestException('Al menos un campo (description, about, title, etc.) es requerido');
    const result = await this.entityManager
      .createQueryBuilder()
      .update<Product>(Product)
      .set(set)
      .where('id = :id', { id: productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .returning(['id'])
      .execute();
    if (result.affected < 1)
      throw new NotFoundException(errorMessages.product.notFound);
    return result.raw[0];
  }

  async activateProduct(productId: number, merchantId: number) {
    if (!(await this.validate(productId)))
      throw new ConflictException(errorMessages.product.notFulfilled);

    const result = await this.entityManager
      .createQueryBuilder()
      .update<Product>(Product)
      .set({
        isActive: true,
      })
      .where('id = :id', { id: productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .returning(['id', 'isActive'])
      .execute();

    const updated = result.raw[0];
    if (updated) {
      this.eventBus.emitEvent(DomainEvents.PRODUCT_ACTIVATED, {
        productId,
        merchantId,
        occurredAt: new Date(),
      } satisfies ProductActivatedPayload);
    }
    return updated;
  }

  async deactivateProduct(productId: number, merchantId: number) {
    const result = await this.entityManager
      .createQueryBuilder()
      .update<Product>(Product)
      .set({ isActive: false })
      .where('id = :id', { id: productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .returning(['id', 'isActive'])
      .execute();
    if (result.affected < 1)
      throw new NotFoundException(errorMessages.product.notFound);
    return result.raw[0];
  }


  async validate(productId: number) {
    const product = await this.entityManager.findOne(Product, {
      where: { id: productId },
    });
    if (!product) throw new NotFoundException(errorMessages.product.notFound);

    const hasDescription =
      typeof product.description === 'string' && product.description.trim().length > 0;
    const hasAbout =
      Array.isArray(product.about) && product.about.length > 0 &&
      product.about.every((item) => typeof item === 'string' && item.trim().length > 0);
    const hasTitle = product.title != null && String(product.title).trim().length > 0;
    const hasCode = product.code != null && String(product.code).trim().length > 0;
    const hasVariationType = product.variationType != null && String(product.variationType).trim().length > 0;

    return hasDescription && hasAbout && hasTitle && hasCode && hasVariationType;
  }

  async deleteProduct(productId: number, merchantId: number) {
    const result = await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Product)
      .where('id = :productId', { productId })
      .andWhere('merchantId = :merchantId', { merchantId })
      .execute();

    if (result.affected < 1)
      throw new NotFoundException(errorMessages.product.notFound);

    return successObject;
  }
}
