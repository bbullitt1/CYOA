// Cloudflare Worker entry point.
// Handles /narrate (Anthropic proxy) and /speak (ElevenLabs TTS proxy).
// All other requests are served from the static assets directory.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response('', { status: 200, headers: cors() });
    }

    // API routes
    if (request.method === 'POST') {
      if (url.pathname === '/narrate') return handleNarrate(request, env);
      if (url.pathname === '/speak')   return handleSpeak(request, env);
    }

    // Static assets (index.html + anything else in the deploy directory)
    if (env.ASSETS) return env.ASSETS.fetch(request);

    return new Response('Not found', { status: 404 });
  },
};

// ─── Anthropic proxy ───────────────────────────────────────────────────────

async function handleNarrate(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: { message: 'Bad JSON' } }, 400); }

  const apiKey = env.ANTHROPIC_API_KEY || body.apiKey;
  if (!apiKey) {
    return json({
      error: { message: 'No API key. Set ANTHROPIC_API_KEY in Cloudflare → Workers & Pages → Settings → Variables.' }
    }, 400);
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body.payload),
    });
    const data = await resp.json();
    return json(data, resp.status);
  } catch (err) {
    return json({ error: { message: 'Could not reach Anthropic: ' + err.message } }, 502);
  }
}

// ─── ElevenLabs TTS proxy ──────────────────────────────────────────────────

async function handleSpeak(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Bad JSON' }, 400); }

  const apiKey = env.ELEVENLABS_API_KEY || body.elevenLabsKey;

  // No key → tell the frontend to fall back to Web Speech API
  if (!apiKey) return json({ fallback: true, reason: 'no_key: ELEVENLABS_API_KEY env var not set and no key in request body' }, 200);

  const { text, voiceId = 'XB0fDUnXU5powFXDhCwa' } = body; // Charlotte (British female)
  if (!text || !text.trim()) return json({ error: 'No text' }, 400);

  try {
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.45, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true },
        }),
      }
    );

    if (!resp.ok) {
      return json({ fallback: true, reason: `ElevenLabs ${resp.status}` }, 200);
    }

    const buf = await resp.arrayBuffer();
    // Workers have no Node Buffer — convert with Web APIs
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return json({ audio: btoa(binary) }, 200);
  } catch (err) {
    return json({ fallback: true, reason: err.message }, 200);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors() });
}

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
