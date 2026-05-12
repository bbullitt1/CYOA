import { useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { callClaude, buildUserMessage, type Message } from '../api/narrate';
import { useAuthStore } from '../store/authStore';
import { useStoryStore, type ChoiceLogEntry } from '../store/storyStore';
import { MAX_NODES } from '../constants/api';
import { saveStory } from '../api/stories';

export type StoryPhase = 'loading' | 'narrating' | 'choosing' | 'ending' | 'error';

export interface StoryEngineControls {
  startStory:  () => Promise<void>;
  makeChoice:  (idx: number) => Promise<void>;
  rewindTo:    (logIdx: number) => Promise<void>;
  fetchNode:   (onError?: () => void) => Promise<void>;
}

export function useStoryEngine(
  setPhase:    (p: StoryPhase) => void,
  setNarration:(t: string) => void,
  setChapter:  (t: string) => void,
  setChoices:  (c: string[]) => void,
  setEnding:   (e: { isFailure: boolean; isMoralLesson: boolean }) => void,
  setError:    (e: string) => void,
) {
  const router = useRouter();
  const { ageGroup, storyPurpose, storyPurposeCustom } = useAuthStore();
  const store = useStoryStore();

  const abortRef = useRef<AbortController | null>(null);

  const systemCtx = { ageGroup, storyPurpose, storyPurposeCustom };

  const fetchNode = useCallback(async (onError?: () => void) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setPhase('loading');
    setNarration('');
    setChapter('');
    setChoices([]);

    const { storyHistory, nodeCount, selectedType } = useStoryStore.getState();

    let raw: string;
    let parsed: Awaited<ReturnType<typeof callClaude>>['parsed'];

    try {
      ({ raw, parsed } = await callClaude(storyHistory, systemCtx, ac.signal));
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      if (onError) {
        onError();
      } else {
        setPhase('error');
        setError((err as Error)?.message ?? 'Something went wrong');
      }
      return;
    }

    if (ac.signal.aborted) return;

    store.pushHistory({ role: 'assistant', content: raw });
    store.setNodeCount(nodeCount + 1);

    const newNodeCount = nodeCount + 1;
    const { narration, chapterTitle, choices, isEnding, isFailure, isMoralLesson } = parsed;

    // Safety: don't end too early unless it's a moral lesson
    const safeIsEnding = (newNodeCount < 4 && !isMoralLesson) ? false : isEnding;

    setNarration(narration);
    setChapter(chapterTitle);

    if (safeIsEnding) {
      const outcome = isMoralLesson ? 'lesson' : isFailure ? 'failure' : 'victory';
      store.setEndingOutcome(outcome);
      setPhase('narrating');
      setEnding({ isFailure, isMoralLesson });

      // Persist story
      if (selectedType) {
        const { choiceLog } = useStoryStore.getState();
        const segments = choiceLog.map((e, i) => ({
          segmentIndex: i,
          narration:    e.narration,
          chapter:      e.chapter,
          choiceMade:   e.choiceText,
          choices:      e.choices,
        }));
        saveStory({
          genre_name:  selectedType.n,
          genre_emoji: selectedType.e,
          story_genre: selectedType.gn,
          age_group:   ageGroup,
          outcome,
          segments,
          messages:    useStoryStore.getState().storyHistory,
        }).then((saved) => {
          store.setCurrentStoryId(saved.id);
        }).catch(() => {});
      }
    } else {
      store.setChoices(choices);
      setPhase('narrating');
    }
  }, [ageGroup, storyPurpose, storyPurposeCustom, store, setPhase, setNarration, setChapter, setChoices, setEnding, setError, systemCtx]);

  const startStory = useCallback(async () => {
    store.resetStory();
    setPhase('loading');
    setNarration('');
    setChapter('');
    setChoices([]);

    const { selectedType } = useStoryStore.getState();
    const firstMsg = buildUserMessage({
      ageGroup,
      storyPurpose,
      storyPurposeCustom,
      storyTheme:    selectedType?.t ?? 'adventure',
      nodeCount:     0,
      choiceHistory: [],
      lastChoice:    null,
    });

    store.setStoryHistory([firstMsg]);
    await fetchNode();
  }, [ageGroup, storyPurpose, storyPurposeCustom, store, fetchNode, setPhase, setNarration, setChapter, setChoices]);

  const makeChoice = useCallback(async (idx: number) => {
    const { storyHistory, choices, choiceLog, nodeCount, currentNarration, currentChapter } = useStoryStore.getState();
    const choiceText = choices[idx];
    if (!choiceText) return;

    // Save snapshot for rewind
    const entry: ChoiceLogEntry = {
      stepNum:         nodeCount,
      choiceText,
      historySnapshot: storyHistory.slice(),
      choices:         choices.slice(),
      narration:       currentNarration,
      chapter:         currentChapter,
    };
    store.pushChoiceLog(entry);

    const historyArr = choiceLog.map((e) => e.choiceText);
    historyArr.push(choiceText);

    const { selectedType } = useStoryStore.getState();
    const nextMsg = buildUserMessage({
      ageGroup,
      storyPurpose,
      storyPurposeCustom,
      storyTheme:    selectedType?.t ?? 'adventure',
      nodeCount,
      choiceHistory: historyArr.slice(0, -1),
      lastChoice:    choiceText,
    });

    store.pushHistory(nextMsg);

    await fetchNode(() => {
      // Rollback
      store.setStoryHistory(storyHistory);
      store.setChoiceLog(choiceLog);
      store.setChoices(choices);
      setNarration(currentNarration);
      setChapter(currentChapter);
      setPhase('choosing');
      setError('Something went wrong — try your choice again!');
    });
  }, [ageGroup, storyPurpose, storyPurposeCustom, store, fetchNode, setNarration, setChapter, setPhase, setError]);

  const rewindTo = useCallback(async (logIdx: number) => {
    const { choiceLog } = useStoryStore.getState();
    const entry = choiceLog[logIdx];
    if (!entry) return;

    store.setStoryHistory(entry.historySnapshot.slice());
    store.setChoiceLog(choiceLog.slice(0, logIdx));
    store.setNodeCount(entry.stepNum);
    store.setChoices(entry.choices);
    setNarration(entry.narration);
    setChapter(entry.chapter);
    setPhase('choosing');
    setChoices(entry.choices);
  }, [store, setNarration, setChapter, setPhase, setChoices]);

  return { startStory, makeChoice, rewindTo, fetchNode };
}
