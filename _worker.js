// Cloudflare Worker — Branched
// Routes: /narrate, /speak (existing) + /auth/*, /api/* (new)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: cors() });

    if (request.method === 'POST') {
      if (path === '/narrate')        return handleNarrate(request, env);
      if (path === '/speak')          return handleSpeak(request, env);
      if (path === '/auth/register')  return handleRegister(request, env);
      if (path === '/auth/login')     return handleLogin(request, env);
    }
    if (request.method === 'GET') {
      if (path === '/auth/google')          return handleGoogleAuth(request, env);
      if (path === '/auth/google/callback') return handleGoogleCallback(request, env);
      if (path === '/api/profile')          return handleGetProfile(request, env);
    }
    if (request.method === 'PUT') {
      if (path === '/api/profile') return handleUpdateProfile(request, env);
    }
    if (request.method === 'POST') {
      if (path === '/api/change-password') return handleChangePassword(request, env);
    }

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
    return json({ error: { message: 'No API key. Set ANTHROPIC_API_KEY in Cloudflare → Workers & Pages → Settings → Variables.' } }, 400);
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body.payload),
    });
    const data = await resp.json();
    return json(data, resp.status);
  } catch (err) {
    return json({ error: { message: 'Could not reach Anthropic: ' + err.message } }, 502);
  }
}

// ─── Google Cloud TTS proxy ────────────────────────────────────────────────

async function handleSpeak(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Bad JSON' }, 400); }

  const apiKey = env.GOOGLE_TTS_API_KEY;
  if (!apiKey) return json({ fallback: true, reason: 'no_key: GOOGLE_TTS_API_KEY env var not set' }, 200);

  const { text, voice = 'en-US-Chirp3-HD-Aoede' } = body;
  if (!text || !text.trim()) return json({ error: 'No text' }, 400);

  const languageCode = voice.slice(0, 5);
  const trimmed = text.trim();
  const isSSML = trimmed.startsWith('<speak>');

  try {
    const resp = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: isSSML ? { ssml: trimmed } : { text: trimmed },
          voice: { languageCode, name: voice },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return json({ fallback: true, reason: `Google TTS ${resp.status}: ${errText}` }, 200);
    }

    const data = await resp.json();
    return json({ audio: data.audioContent }, 200);
  } catch (err) {
    return json({ fallback: true, reason: err.message }, 200);
  }
}

// ─── Auth: register ────────────────────────────────────────────────────────

async function handleRegister(request, env) {
  if (!env.DB) return json({ error: 'Database not configured. Add a D1 binding named DB.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

  const { email, password } = body;
  if (!email || !password) return json({ error: 'Email and password are required.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400);

  await ensureSchema(env.DB);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
  if (existing) return json({ error: 'An account with this email already exists.' }, 409);

  const { hash, salt } = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  await env.DB.prepare(
    'INSERT INTO users (id,email,password_hash,password_salt,age_group,story_purpose,story_purpose_custom,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(id, email.toLowerCase(), hash, salt, 'older', 'entertainment', '', now, now).run();

  const token = await signJWT({ sub: id, email: email.toLowerCase() }, jwtSecret(env));
  return json({ token, user: { id, email: email.toLowerCase(), age_group: 'older', story_purpose: 'entertainment', story_purpose_custom: '', isNew: true } });
}

// ─── Auth: login ───────────────────────────────────────────────────────────

async function handleLogin(request, env) {
  if (!env.DB) return json({ error: 'Database not configured.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

  const { email, password } = body;
  if (!email || !password) return json({ error: 'Email and password are required.' }, 400);

  await ensureSchema(env.DB);

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email.toLowerCase()).first();
  if (!user) return json({ error: 'Invalid email or password.' }, 401);
  if (!user.password_hash) return json({ error: 'This account was created with Google. Please sign in with Google.' }, 401);

  const ok = await verifyPassword(password, user.password_hash, user.password_salt);
  if (!ok) return json({ error: 'Invalid email or password.' }, 401);

  const token = await signJWT({ sub: user.id, email: user.email }, jwtSecret(env));
  return json({ token, user: pick(user) });
}

// ─── Auth: Google OAuth ────────────────────────────────────────────────────

async function handleGoogleAuth(request, env) {
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) return new Response('Google OAuth not configured. Set GOOGLE_CLIENT_ID env var.', { status: 503 });
  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/auth/google/callback`,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'online',
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302);
}

async function handleGoogleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return Response.redirect('/?auth_error=google_cancelled', 302);

  const clientId     = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return Response.redirect('/?auth_error=google_not_configured', 302);

  try {
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: `${url.origin}/auth/google/callback`, grant_type: 'authorization_code' }),
    });
    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) return Response.redirect('/?auth_error=google_token', 302);

    const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const gUser = await userResp.json();
    if (!gUser.email) return Response.redirect('/?auth_error=google_userinfo', 302);

    await ensureSchema(env.DB);
    const now = Math.floor(Date.now() / 1000);

    let user = await env.DB.prepare('SELECT * FROM users WHERE sso_provider=? AND sso_id=?').bind('google', gUser.id).first();
    if (!user) user = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(gUser.email.toLowerCase()).first();

    let isNew = false;
    if (!user) {
      isNew = true;
      const id = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO users (id,email,sso_provider,sso_id,age_group,story_purpose,story_purpose_custom,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)'
      ).bind(id, gUser.email.toLowerCase(), 'google', gUser.id, 'older', 'entertainment', '', now, now).run();
      user = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
    } else if (!user.sso_id) {
      await env.DB.prepare('UPDATE users SET sso_provider=?,sso_id=?,updated_at=? WHERE id=?').bind('google', gUser.id, now, user.id).run();
    }

    const token = await signJWT({ sub: user.id, email: user.email }, jwtSecret(env));
    return Response.redirect(`/?token=${encodeURIComponent(token)}&isNew=${isNew}`, 302);
  } catch (err) {
    return Response.redirect(`/?auth_error=${encodeURIComponent(err.message)}`, 302);
  }
}

// ─── API: change password ──────────────────────────────────────────────────

async function handleChangePassword(request, env) {
  if (!env.DB) return json({ error: 'Database not configured.' }, 503);
  const authUser = await authenticate(request, env);
  if (!authUser) return json({ error: 'Unauthorized' }, 401);
  if (!authUser.password_hash) return json({ error: 'This account uses Google sign-in. Password cannot be changed here.' }, 400);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) return json({ error: 'Current and new password are required.' }, 400);
  if (newPassword.length < 8) return json({ error: 'New password must be at least 8 characters.' }, 400);
  const ok = await verifyPassword(currentPassword, authUser.password_hash, authUser.password_salt);
  if (!ok) return json({ error: 'Current password is incorrect.' }, 401);
  const { hash, salt } = await hashPassword(newPassword);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare('UPDATE users SET password_hash=?,password_salt=?,updated_at=? WHERE id=?').bind(hash, salt, now, authUser.id).run();
  return json({ ok: true });
}

// ─── API: profile ──────────────────────────────────────────────────────────

async function handleGetProfile(request, env) {
  const user = await authenticate(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  return json({ user: pick(user) });
}

async function handleUpdateProfile(request, env) {
  const authUser = await authenticate(request, env);
  if (!authUser) return json({ error: 'Unauthorized' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

  const { age_group, story_purpose, story_purpose_custom } = body;
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    'UPDATE users SET age_group=?,story_purpose=?,story_purpose_custom=?,updated_at=? WHERE id=?'
  ).bind(age_group || 'older', story_purpose || 'entertainment', story_purpose_custom || '', now, authUser.id).run();

  const user = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(authUser.id).first();
  return json({ user: pick(user) });
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function authenticate(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const payload = await verifyJWT(auth.slice(7), jwtSecret(env));
    if (!env.DB) return payload;
    return await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(payload.sub).first();
  } catch { return null; }
}

function pick(u) {
  return { id: u.id, email: u.email, age_group: u.age_group, story_purpose: u.story_purpose, story_purpose_custom: u.story_purpose_custom };
}

async function ensureSchema(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      password_salt TEXT,
      sso_provider TEXT,
      sso_id TEXT,
      age_group TEXT NOT NULL DEFAULT 'older',
      story_purpose TEXT NOT NULL DEFAULT 'entertainment',
      story_purpose_custom TEXT DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_sso   ON users(sso_provider, sso_id);
  `);
}

function jwtSecret(env) {
  return env.JWT_SECRET || 'branched-dev-secret-CHANGE-IN-PRODUCTION';
}

// PBKDF2 password hashing via Web Crypto API
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return { hash, salt: saltHex };
}

async function verifyPassword(password, storedHash, storedSalt) {
  const salt = new Uint8Array(storedSalt.match(/.{2}/g).map(b => parseInt(b, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hash === storedHash;
}

// HS256 JWT via Web Crypto API
function b64url(str) {
  return btoa(typeof str === 'string' ? str : String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function b64urlDecode(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

async function signJWT(payload, secret) {
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 days
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = b64url(JSON.stringify({ ...payload, exp, iat: Math.floor(Date.now() / 1000) }));
  const msg    = `${header}.${body}`;
  const key    = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return `${msg}.${b64url(sig)}`;
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [header, body, sig] = parts;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const sigBytes = new Uint8Array(b64urlDecode(sig).split('').map(c => c.charCodeAt(0)));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(`${header}.${body}`));
  if (!valid) throw new Error('Invalid signature');
  const payload = JSON.parse(b64urlDecode(body));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors() });
}

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  };
}
