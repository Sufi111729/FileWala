import { deleteMessage } from '../../_lib/contactStore.js';
import { methodNotAllowed, requireAdmin, sendJson } from '../../_lib/http.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'DELETE') {
    methodNotAllowed(res, ['DELETE']);
    return;
  }

  const id = String(req.query?.id ?? '').trim();
  if (!id) {
    sendJson(res, 400, { error: 'Message id is required.' });
    return;
  }

  const deleted = await deleteMessage(id);
  if (!deleted) {
    sendJson(res, 404, { error: 'Message not found.' });
    return;
  }

  sendJson(res, 200, { ok: true });
}
