import { clearSessionCookie, methodNotAllowed, sendJson } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  sendJson(res, 200, { ok: true });
}
