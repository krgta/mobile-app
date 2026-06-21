import { api } from '@/api/api';
import type { User } from '@/types/user';

export interface UpdatedUser {
  name?: string;
  profile_picture?: string | null;
}

export async function updateCurrentUser(data: UpdatedUser): Promise<User> {
  const response = await api.put<User>('/users/me', data);
  return response.data;
}
