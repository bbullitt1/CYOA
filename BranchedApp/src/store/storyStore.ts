import { create } from 'zustand';
import type { Message } from '../api/narrate';
import type { StoryType } from '../constants/storyTypes';

export interface ChoiceLogEntry {
  stepNum:         number;
  choiceText:      string;
  historySnapshot: Message[];
  choices:         string[];
  narration:       string;
  chapter:         string;
}

interface StoryState {
  selectedType:    StoryType | null;
  storyHistory:    Message[];
  choices:         string[];
  choiceLog:       ChoiceLogEntry[];
  nodeCount:       number;
  currentNarration:string;
  currentChapter:  string;
  currentStoryId:  string | null;

  setSelectedType:     (t: StoryType | null) => void;
  setStoryHistory:     (h: Message[]) => void;
  pushHistory:         (m: Message) => void;
  setChoices:          (c: string[]) => void;
  setChoiceLog:        (l: ChoiceLogEntry[]) => void;
  pushChoiceLog:       (e: ChoiceLogEntry) => void;
  setNodeCount:        (n: number) => void;
  setCurrentNarration: (s: string) => void;
  setCurrentChapter:   (s: string) => void;
  setCurrentStoryId:   (id: string | null) => void;
  resetStory:          () => void;
}

const STORY_DEFAULTS = {
  storyHistory:     [] as Message[],
  choices:          [] as string[],
  choiceLog:        [] as ChoiceLogEntry[],
  nodeCount:        0,
  currentNarration: '',
  currentChapter:   '',
  currentStoryId:   null as string | null,
};

export const useStoryStore = create<StoryState>((set) => ({
  selectedType: null,
  ...STORY_DEFAULTS,

  setSelectedType:     (t)  => set({ selectedType: t }),
  setStoryHistory:     (h)  => set({ storyHistory: h }),
  pushHistory:         (m)  => set((s) => ({ storyHistory: [...s.storyHistory, m] })),
  setChoices:          (c)  => set({ choices: c }),
  setChoiceLog:        (l)  => set({ choiceLog: l }),
  pushChoiceLog:       (e)  => set((s) => ({ choiceLog: [...s.choiceLog, e] })),
  setNodeCount:        (n)  => set({ nodeCount: n }),
  setCurrentNarration: (s)  => set({ currentNarration: s }),
  setCurrentChapter:   (s)  => set({ currentChapter: s }),
  setCurrentStoryId:   (id) => set({ currentStoryId: id }),
  resetStory:          ()   => set(STORY_DEFAULTS),
}));
