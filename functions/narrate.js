// Cloudflare Pages Function — Anthropic API proxy.
// Reads ANTHROPIC_API_KEY from Cloudflare env vars, or falls back to
// an apiKey value sent in the request body (for local dev).

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: { message: 'Bad request body.' } }), {
      status: 400,
      headers: cors(),
    });
  }

  const apiKey = env.ANTHROPIC_API_KEY || body.apiKey;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'No API key found. Set ANTHROPIC_API_KEY in Cloudflare → Pages → Settings → Environment variables.' } }),
      { status: 400, headers: cors() }
    );
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
    return new Response(JSON.stringify(data), { status: resp.status, headers: cors() });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: 'Could not reach Anthropic: ' + err.message } }),
      { status: 502, headers: cors() }
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
