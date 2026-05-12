import * as FileSystem from 'expo-file-system/legacy';
import { ENDPOINTS, TTS_VOICE } from '../constants/api';
import { apiFetch } from './client';

// In-memory cache: voice+text → base64
const ttsCache = new Map<string, string>();

export async function fetchTTSAudio(text: string, signal?: AbortSignal): Promise<string | null> {
  const key = TTS_VOICE + '|' + text;
  if (ttsCache.has(key)) return ttsCache.get(key)!;

  try {
    const res = await apiFetch(ENDPOINTS.speak, {
      method: 'POST',
      signal,
      body:   JSON.stringify({ text, voice: TTS_VOICE }),
    });
    if (!res.ok) return null;

    const data = await res.json() as { audio?: string; fallback?: boolean };
    if (!data.audio || data.fallback) return null;

    ttsCache.set(key, data.audio);
    return data.audio;
  } catch {
    return null;
  }
}

export async function writeTTSToFile(base64Audio: string, token: number): Promise<string> {
  const uri = `${FileSystem.cacheDirectory}tts_${token}_${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(uri, base64Audio, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

export function clearTTSCache(): void {
  ttsCache.clear();
}
