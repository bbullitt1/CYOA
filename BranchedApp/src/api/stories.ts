import { ENDPOINTS } from '../constants/api';
import { apiJSON } from './client';

export interface StorySegment {
  segmentIndex: number;
  narration:    string;
  chapter:      string;
  choiceMade:   string | null;
  choices:      string[];
}

export interface SavedStory {
  id:          string;
  genre_name:  string;
  genre_emoji: string;
  story_genre: string;
  age_group:   string;
  outcome:     'victory' | 'failure' | 'lesson';
  segments:    StorySegment[];
  created_at:  string;
}

export async function saveStory(params: {
  genre_name:  string;
  genre_emoji: string;
  story_genre: string;
  age_group:   string;
  outcome:     'victory' | 'failure' | 'lesson';
  segments:    StorySegment[];
  messages:    Array<{ role: string; content: string }>;
}): Promise<SavedStory> {
  return apiJSON<SavedStory>(ENDPOINTS.stories, {
    method: 'POST',
    body:   JSON.stringify(params),
  });
}

export async function listStories(): Promise<SavedStory[]> {
  return apiJSON<SavedStory[]>(ENDPOINTS.stories);
}

export async function getStory(storyId: string): Promise<SavedStory> {
  return apiJSON<SavedStory>(`${ENDPOINTS.stories}/${storyId}`);
}
