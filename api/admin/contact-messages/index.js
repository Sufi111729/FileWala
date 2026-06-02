import { deleteAllMessages, listMessages } from '../../_lib/contactStore.js';
import { methodNotAllowed, requireAdmin, sendJson } from '../../_lib/http.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const messages = await listMessages();
    sendJson(res, 200, { messages });
    return;
  }

  if (req.method === 'DELETE') {
    await deleteAllMessages();
    sendJson(res, 200, { ok: true });
    return;
  }

  methodNotAllowed(res, ['GET', 'DELETE']);
}
