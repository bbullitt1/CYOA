import { ENDPOINTS, CLAUDE_MODEL } from '../constants/api';
import { buildSystemPrompt, buildUserContext } from '../constants/prompts';
import { parseStoryResponse, type ParsedStory } from '../utils/parseStory';
import { apiFetch } from './client';

export interface Message {
  role:    'user' | 'assistant';
  content: string;
}

export interface NarrateContext {
  ageGroup:           'young' | 'older';
  storyPurpose:       'entertainment' | 'decisions' | 'other';
  storyPurposeCustom: string;
  storyTheme:         string;
  nodeCount:          number;
  choiceHistory:      string[];
  lastChoice:         string | null;
}

export function buildUserMessage(ctx: NarrateContext): Message {
  return {
    role:    'user',
    content: buildUserContext({
      storyTheme:         ctx.storyTheme,
      ageGroup:           ctx.ageGroup,
      storyPurpose:       ctx.storyPurpose,
      storyPurposeCustom: ctx.storyPurposeCustom,
      nodeCount:          ctx.nodeCount,
      choiceHistory:      ctx.choiceHistory,
      lastChoice:         ctx.lastChoice,
    }),
  };
}

export async function callClaude(
  messages:  Message[],
  systemCtx: Pick<NarrateContext, 'ageGroup' | 'storyPurpose' | 'storyPurposeCustom'>,
  signal?:   AbortSignal,
): Promise<{ raw: string; parsed: ParsedStory }> {
  const system = buildSystemPrompt({
    ageGroup:           systemCtx.ageGroup,
    storyPurpose:       systemCtx.storyPurpose,
    storyPurposeCustom: systemCtx.storyPurposeCustom,
  });

  const res = await apiFetch(ENDPOINTS.narrate, {
    method: 'POST',
    signal,
    body:   JSON.stringify({
      payload: {
        model:      CLAUDE_MODEL,
        max_tokens: 1024,
        system,
        messages,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json() as { content?: Array<{ text: string }> };
  const raw  = data?.content?.[0]?.text ?? '';
  if (!raw) throw new Error('Story response garbled — please try again!');

  const parsed = parseStoryResponse(raw);
  if (!parsed.narration) throw new Error('Story response garbled — please try again!');

  return { raw, parsed };
}
