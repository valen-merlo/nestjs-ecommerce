import { apiGet } from './client';
import type { Profile } from './types';

export function getProfile(token: string): Promise<Profile> {
  return apiGet<Profile>('/user/profile', token);
}
