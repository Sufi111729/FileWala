import { createSessionCookie, methodNotAllowed, readJson, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    sendJson(res, 500, { error: 'Admin login is not configured.' });
    return;
  }

  const body = await readJson(req);
  const username = String(body.username ?? '').trim();
  const password = String(body.password ?? '');

  if (username !== adminUsername || password !== adminPassword) {
    sendJson(res, 401, { error: 'Invalid username or password.' });
    return;
  }

  const cookie = createSessionCookie();
  if (!cookie) {
    sendJson(res, 500, { error: 'Admin session is not configured.' });
    return;
  }

  res.setHeader('Set-Cookie', cookie);
  sendJson(res, 200, { ok: true });
}
