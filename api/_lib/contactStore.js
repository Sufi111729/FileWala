import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const storagePath = process.env.CONTACT_MESSAGES_FILE
  || path.join(os.tmpdir(), 'filewalatool-contact-messages.json');
const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

async function readMessagesRaw() {
  try {
    const data = await fs.readFile(storagePath, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeMessages(messages) {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });
  await fs.writeFile(storagePath, JSON.stringify(messages, null, 2), 'utf8');
}

export function removeExpiredMessages(messages, now = Date.now()) {
  return messages.filter((message) => {
    const created = Date.parse(message.createdAt);
    return Number.isFinite(created) && now - created <= fiveDaysMs;
  });
}

export async function cleanupExpiredMessages() {
  const messages = await readMessagesRaw();
  const activeMessages = removeExpiredMessages(messages);
  if (activeMessages.length !== messages.length) {
    await writeMessages(activeMessages);
  }
  return activeMessages;
}

export async function listMessages() {
  const messages = await cleanupExpiredMessages();
  return messages.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function addMessage({ name, email, subject = '', message }) {
  const messages = await cleanupExpiredMessages();
  const nextMessage = {
    id: crypto.randomUUID(),
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
    status: 'unread',
  };

  messages.push(nextMessage);
  await writeMessages(messages);
  return nextMessage;
}

export async function deleteMessage(id) {
  const messages = await cleanupExpiredMessages();
  const nextMessages = messages.filter((message) => message.id !== id);
  await writeMessages(nextMessages);
  return nextMessages.length !== messages.length;
}

export async function deleteAllMessages() {
  await writeMessages([]);
}
