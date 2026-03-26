// Serverless proxy — keeps the API key off the client and avoids CORS.
// Reads ANTHROPIC_API_KEY from Netlify environment variables, or falls back
// to an apiKey value sent in the request body (handy for local dev).

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: { message: 'Bad request body.' } }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || body.apiKey;
  if (!apiKey) {
    return {
      statusCode: 400,
      headers: cors(),
      body: JSON.stringify({ error: { message: 'No API key found. Set ANTHROPIC_API_KEY in Netlify → Site configuration → Environment variables.' } })
    };
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body.payload)
    });

    const data = await resp.json();
    return { statusCode: resp.status, headers: cors(), body: JSON.stringify(data) };
  } catch (err) {
    return {
      statusCode: 502,
      headers: cors(),
      body: JSON.stringify({ error: { message: 'Could not reach Anthropic: ' + err.message } })
    };
  }
};

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}
