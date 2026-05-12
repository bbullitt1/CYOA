import { useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { fetchTTSAudio, writeTTSToFile } from '../api/speak';
import * as FileSystem from 'expo-file-system/legacy';

export interface StoryAudioControls {
  isSpeaking:     boolean;
  isPaused:       boolean;
  duration:       number;  // ms
  position:       number;  // ms
  playNarration:  (text: string, onDone?: () => void) => Promise<void>;
  stopAll:        () => Promise<void>;
  pauseToggle:    () => Promise<void>;
  seekBack10s:    () => Promise<void>;
  seekTo:         (fraction: number) => Promise<void>;
  replayLast:     () => void;
}

export function useStoryAudio(onSpeakingChange?: (v: boolean) => void): StoryAudioControls {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused,   setIsPaused]   = useState(false);
  const [duration,   setDuration]   = useState(0);
  const [position,   setPosition]   = useState(0);

  const tokenRef       = useRef(0);
  const soundRef       = useRef<Audio.Sound | null>(null);
  const lastTextRef    = useRef<string>('');
  const lastOnDoneRef  = useRef<(() => void) | undefined>(undefined);
  const abortRef       = useRef<AbortController | null>(null);
  const durationRef    = useRef(0);

  const setSpeaking = useCallback((v: boolean) => {
    setIsSpeaking(v);
    onSpeakingChange?.(v);
  }, [onSpeakingChange]);

  const unloadCurrent = useCallback(async () => {
    const s = soundRef.current;
    if (s) {
      soundRef.current = null;
      try { await s.stopAsync(); } catch {}
      try { await s.unloadAsync(); } catch {}
    }
  }, []);

  const playFile = useCallback(async (uri: string, token: number): Promise<void> => {
    return new Promise(async (resolve) => {
      if (tokenRef.current !== token) { resolve(); return; }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 200 },
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.durationMillis != null && status.durationMillis > 0) {
          setDuration(status.durationMillis);
          durationRef.current = status.durationMillis;
        }
        setPosition(status.positionMillis ?? 0);
        if (status.didJustFinish) {
          soundRef.current = null;
          sound.unloadAsync().catch(() => {});
          resolve();
        }
      });

      if (tokenRef.current !== token) {
        await unloadCurrent();
        resolve();
      }
    });
  }, [unloadCurrent]);

  const playNarration = useCallback(async (text: string, onDone?: () => void) => {
    lastTextRef.current   = text;
    lastOnDoneRef.current = onDone;

    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    const token = ++tokenRef.current;
    await unloadCurrent();
    setSpeaking(true);
    setIsPaused(false);
    setDuration(0);
    setPosition(0);
    durationRef.current = 0;

    try {
      const base64 = await fetchTTSAudio(text, abortController.signal);

      if (tokenRef.current !== token) return;

      if (!base64) {
        setSpeaking(false);
        onDone?.();
        return;
      }

      const uri = await writeTTSToFile(base64, token);

      if (tokenRef.current !== token) {
        FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
        return;
      }

      await playFile(uri, token);
      FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});

      if (tokenRef.current === token) {
        setSpeaking(false);
        setIsPaused(false);
        onDone?.();
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      if (tokenRef.current === token) {
        setSpeaking(false);
        onDone?.();
      }
    }
  }, [playFile, setSpeaking, unloadCurrent]);

  const stopAll = useCallback(async () => {
    abortRef.current?.abort();
    tokenRef.current++;
    await unloadCurrent();
    setSpeaking(false);
    setIsPaused(false);
    setDuration(0);
    setPosition(0);
    durationRef.current = 0;
  }, [unloadCurrent, setSpeaking]);

  const pauseToggle = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPaused(true);
    } else {
      await sound.playAsync();
      setIsPaused(false);
    }
  }, []);

  const seekBack10s = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    const pos = Math.max(0, (status.positionMillis ?? 0) - 10000);
    await sound.setPositionAsync(pos);
  }, []);

  const seekTo = useCallback(async (fraction: number) => {
    const sound = soundRef.current;
    if (!sound || !durationRef.current) return;
    await sound.setPositionAsync(Math.max(0, fraction * durationRef.current));
  }, []);

  const replayLast = useCallback(() => {
    if (!lastTextRef.current) return;
    playNarration(lastTextRef.current, lastOnDoneRef.current);
  }, [playNarration]);

  return { isSpeaking, isPaused, duration, position, playNarration, stopAll, pauseToggle, seekBack10s, seekTo, replayLast };
}
