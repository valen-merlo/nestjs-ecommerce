import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DomainEvents } from 'src/events/events.constants';
import type {
  ProductCreatedPayload,
  ProductActivatedPayload,
} from 'src/events/product.events';
import { ActivityLog } from 'src/database/entities/activity-log.entity';

export interface ActivityItem {
  type: string;
  payload: ProductCreatedPayload | ProductActivatedPayload | Record<string, unknown>;
  at: string;
}

const MAX_ITEMS = 100;

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async push(
    type: typeof DomainEvents.PRODUCT_CREATED | typeof DomainEvents.PRODUCT_ACTIVATED,
    payload: ProductCreatedPayload | ProductActivatedPayload,
  ): Promise<void> {
    const plain = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
    await this.activityLogRepository.insert({
      type,
      payload: plain,
    });
  }

  async getRecent(): Promise<ActivityItem[]> {
    try {
      const logs = await this.activityLogRepository.find({
        order: { createdAt: 'DESC' },
        take: MAX_ITEMS,
      });
      return logs.map((log) => ({
        type: log.type,
        payload: log.payload as unknown as ProductCreatedPayload | ProductActivatedPayload,
        at: new Date(log.createdAt).toISOString(),
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/relation "activity_log" does not exist|table.*activity_log/i.test(msg)) {
        throw new ServiceUnavailableException(
          'La tabla activity_log no existe. Ejecuta: npm run migration:run',
        );
      }
      throw err;
    }
  }
}
