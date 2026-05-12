import { useState, useCallback, useRef } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export interface VoiceRecognitionControls {
  isListening:    boolean;
  isSupported:    boolean;
  startListening: (choices?: string[]) => void;
  stopListening:  () => void;
  matchChoice:    (transcripts: string[], choices: string[]) => number;
}

export function useVoiceRecognition(onResult: (choiceIdx: number) => void): VoiceRecognitionControls {
  const [isListening, setIsListening] = useState(false);
  const choicesRef = useRef<string[]>([]);

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end',   () => setIsListening(false));

  useSpeechRecognitionEvent('result', (event) => {
    const transcripts = event.results.map((r: { transcript: string }) => r.transcript);
    const idx = matchChoice(transcripts, choicesRef.current);
    if (idx >= 0) {
      ExpoSpeechRecognitionModule.stop();
      onResult(idx);
    }
  });

  useSpeechRecognitionEvent('error', () => {
    setIsListening(false);
  });

  const startListening = useCallback((choices?: string[]) => {
    if (choices) choicesRef.current = choices;
    ExpoSpeechRecognitionModule.start({
      lang:             'en-US',
      interimResults:   false,
      maxAlternatives:  5,
      continuous:       false,
    });
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return {
    isListening,
    isSupported: true,
    startListening: (choices?: string[]) => {
      if (choices) choicesRef.current = choices;
      startListening();
    },
    stopListening,
    matchChoice,
  };
}

export function matchChoice(transcripts: string[], choices: string[]): number {
  const all = transcripts.join(' ').toLowerCase();

  if (/\b(one|first|1)\b/.test(all)) return 0;
  if (/\b(two|second|2)\b/.test(all)) return 1;
  if (choices.length >= 3 && /\b(three|third|3)\b/.test(all)) return 2;

  // Keyword scoring
  const scores = choices.map((c) => {
    const words = c.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    return words.filter((w) => all.includes(w)).length;
  });
  const best    = Math.max(...scores);
  const bestIdx = scores.indexOf(best);
  if (best > 0 && scores.filter((s) => s === best).length === 1) return bestIdx;

  return -1;
}
