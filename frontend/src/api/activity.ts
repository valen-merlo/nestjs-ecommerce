import { apiGet } from './client';
import type { ActivityItem } from './types';

export function getActivity(token?: string | null): Promise<ActivityItem[]> {
  return apiGet<ActivityItem[]>('/activity', token ?? undefined);
}
