// ElevenLabs TTS proxy.
// Reads ELEVENLABS_API_KEY from Netlify env vars, or falls back to a key
// sent in the request body (for local dev / gear-menu override).
// If no key is available, returns { fallback: true } — the frontend will
// then use the browser's built-in Web Speech API instead.

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Bad JSON' }) }; }

  const apiKey = process.env.ELEVENLABS_API_KEY || body.elevenLabsKey;

  // No key → tell frontend to use fallback TTS (not an error)
  if (!apiKey) {
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ fallback: true }) };
  }

  const { text, voiceId = 'XB0fDUnXU5powFXDhCwa' } = body; // Charlotte (British female) default

  if (!text || !text.trim()) {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'No text' }) };
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
      const errText = await resp.text().catch(() => resp.status);
      console.error('ElevenLabs error', resp.status, errText);
      // Return fallback rather than crashing the app
      return {
        statusCode: 200,
        headers: cors(),
        body: JSON.stringify({ fallback: true, reason: `ElevenLabs ${resp.status}` }),
      };
    }

    const buf    = await resp.arrayBuffer();
    const base64 = Buffer.from(buf).toString('base64');

    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ audio: base64 }),
    };
  } catch (err) {
    console.error('speak function threw:', err);
    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ fallback: true, reason: err.message }),
    };
  }
};

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
