import { ENDPOINTS } from '../constants/api';
import { apiJSON, setToken, clearToken } from './client';

export interface UserProfile {
  id:                 string;
  email:              string;
  age_group:          'young' | 'older' | null;
  story_purpose:      'entertainment' | 'decisions' | 'other' | null;
  story_purpose_custom: string | null;
}

interface AuthResponse {
  token: string;
  user:  UserProfile;
  isNew?: boolean;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const data = await apiJSON<AuthResponse>(ENDPOINTS.register, {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await apiJSON<AuthResponse>(ENDPOINTS.login, {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  return data;
}

export async function getProfile(): Promise<UserProfile> {
  return apiJSON<UserProfile>(ENDPOINTS.profile);
}

export async function updateProfile(updates: Partial<Pick<UserProfile, 'age_group' | 'story_purpose' | 'story_purpose_custom'>>): Promise<UserProfile> {
  return apiJSON<UserProfile>(ENDPOINTS.profile, {
    method: 'PUT',
    body:   JSON.stringify(updates),
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiJSON(ENDPOINTS.changePassword, {
    method: 'POST',
    body:   JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function signOut(): Promise<void> {
  await clearToken();
}
