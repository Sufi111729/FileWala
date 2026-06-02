import { addMessage } from './_lib/contactStore.js';
import { methodNotAllowed, readJson, sendJson } from './_lib/http.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const body = await readJson(req);
    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 180).toLowerCase();
    const subject = cleanText(body.subject, 180);
    const message = cleanText(body.message, 4000);

    if (!name) {
      sendJson(res, 400, { error: 'Name is required.' });
      return;
    }

    if (!email || !emailPattern.test(email)) {
      sendJson(res, 400, { error: 'Please enter a valid email address.' });
      return;
    }

    if (!message) {
      sendJson(res, 400, { error: 'Message is required.' });
      return;
    }

    const savedMessage = await addMessage({ name, email, subject, message });
    sendJson(res, 201, { message: 'Message saved.', id: savedMessage.id });
  } catch {
    sendJson(res, 500, { error: 'Could not save your message right now.' });
  }
}
