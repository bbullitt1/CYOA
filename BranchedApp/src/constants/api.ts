export const WORKER_BASE = 'https://cyoa.bbullitt.workers.dev';

export const ENDPOINTS = {
  narrate:        `${WORKER_BASE}/narrate`,
  speak:          `${WORKER_BASE}/speak`,
  register:       `${WORKER_BASE}/auth/register`,
  login:          `${WORKER_BASE}/auth/login`,
  googleAuth:     `${WORKER_BASE}/auth/google`,
  profile:        `${WORKER_BASE}/api/profile`,
  changePassword: `${WORKER_BASE}/api/change-password`,
  stories:        `${WORKER_BASE}/api/stories`,
} as const;

export const TTS_VOICE = 'en-US-Chirp3-HD-Aoede';
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
export const MAX_NODES = 6;
