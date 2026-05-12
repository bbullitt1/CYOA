import { create } from 'zustand';
import type { UserProfile } from '../api/auth';

interface AuthState {
  user:               UserProfile | null;
  isLoaded:           boolean;
  ageGroup:           'young' | 'older';
  storyPurpose:       'entertainment' | 'decisions' | 'other';
  storyPurposeCustom: string;

  setUser:   (user: UserProfile | null) => void;
  setLoaded: (v: boolean) => void;
  applyProfile: (user: UserProfile) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:               null,
  isLoaded:           false,
  ageGroup:           'young',
  storyPurpose:       'entertainment',
  storyPurposeCustom: '',

  setUser:   (user) => set({ user }),
  setLoaded: (v)    => set({ isLoaded: v }),

  applyProfile: (user) => set({
    user,
    ageGroup:           (user.age_group as 'young' | 'older') ?? 'young',
    storyPurpose:       (user.story_purpose as 'entertainment' | 'decisions' | 'other') ?? 'entertainment',
    storyPurposeCustom: user.story_purpose_custom ?? '',
  }),

  reset: () => set({
    user:               null,
    ageGroup:           'young',
    storyPurpose:       'entertainment',
    storyPurposeCustom: '',
  }),
}));
