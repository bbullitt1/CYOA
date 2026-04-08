// Cloudflare Pages Function — ElevenLabs TTS proxy.
// Reads ELEVENLABS_API_KEY from Cloudflare env vars, or falls back to a key
// sent in the request body (for local dev / gear-menu override).
// If no key is available, returns { fallback: true } — the frontend will
// then use the browser's built-in Web Speech API instead.

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad JSON' }), {
      status: 400,
      headers: cors(),
    });
  }

  const apiKey = env.ELEVENLABS_API_KEY || body.elevenLabsKey;

  // No key → tell frontend to use fallback TTS (not an error)
  if (!apiKey) {
    return new Response(JSON.stringify({ fallback: true }), { status: 200, headers: cors() });
  }

  const { text, voiceId = 'XB0fDUnXU5powFXDhCwa' } = body; // Charlotte (British female) default

  if (!text || !text.trim()) {
    return new Response(JSON.stringify({ error: 'No text' }), { status: 400, headers: cors() });
  }

  try {
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text().catch(() => String(resp.status));
      console.error('ElevenLabs error', resp.status, errText);
      return new Response(
        JSON.stringify({ fallback: true, reason: `ElevenLabs ${resp.status}` }),
        { status: 200, headers: cors() }
      );
    }

    const buf = await resp.arrayBuffer();
    // Cloudflare Workers don't have Node's Buffer — use Web APIs instead
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return new Response(JSON.stringify({ audio: base64 }), { status: 200, headers: cors() });
  } catch (err) {
    console.error('speak function threw:', err);
    return new Response(
      JSON.stringify({ fallback: true, reason: err.message }),
      { status: 200, headers: cors() }
    );
  }
}

export async function onRequestOptions() {
  return new Response('', { status: 200, headers: cors() });
}

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
