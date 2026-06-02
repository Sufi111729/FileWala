import crypto from 'node:crypto';

const sessionCookie = 'filewala_admin_session';
const sessionMaxAgeSeconds = 60 * 60 * 2;

function parseCookieHeader(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf('=');
        if (index === -1) return [item, ''];
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
      }),
  );
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function sign(value) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}

export function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

export function createSessionCookie() {
  const username = process.env.ADMIN_USERNAME;
  const secret = getSessionSecret();
  if (!username || !secret) return null;

  const expiresAt = Date.now() + sessionMaxAgeSeconds * 1000;
  const payload = `${username}.${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;
  return `${sessionCookie}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${sessionMaxAgeSeconds}`;
}

export function clearSessionCookie() {
  return `${sessionCookie}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function isAuthenticated(req) {
  const username = process.env.ADMIN_USERNAME;
  const secret = getSessionSecret();
  if (!username || !secret) return false;

  const cookies = parseCookieHeader(req.headers.cookie);
  const token = cookies[sessionCookie];
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [tokenUsername, expiresAt, signature] = parts;
  const payload = `${tokenUsername}.${expiresAt}`;
  const expected = sign(payload);
  const notExpired = Number(expiresAt) > Date.now();
  const signaturesMatch = signature.length === expected.length
    && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  return tokenUsername === username && notExpired && signaturesMatch;
}

export function requireAdmin(req, res) {
  if (isAuthenticated(req)) return true;
  sendJson(res, 401, { error: 'Unauthorized' });
  return false;
}

export function methodNotAllowed(res, methods) {
  res.setHeader('Allow', methods.join(', '));
  sendJson(res, 405, { error: 'Method not allowed' });
}
