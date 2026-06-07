export const CONTACT_MESSAGES_STORAGE_KEY = 'filewalatool_contact_messages';
export const CONTACT_MESSAGES_UPDATED_EVENT = 'filewalatool:contact-messages-updated';

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `contact-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function notifyMessagesUpdated() {
  window.dispatchEvent(new CustomEvent(CONTACT_MESSAGES_UPDATED_EVENT));
}

export function getContactMessages() {
  const storedValue = window.localStorage.getItem(CONTACT_MESSAGES_STORAGE_KEY);
  if (!storedValue) return [];

  try {
    const messages = JSON.parse(storedValue);
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

function saveContactMessages(messages) {
  window.localStorage.setItem(CONTACT_MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  notifyMessagesUpdated();
  return messages;
}

export function addContactMessage(fields) {
  const message = {
    id: createId(),
    name: fields.name,
    email: fields.email,
    phone: fields.phone || '',
    subject: fields.subject || '',
    message: fields.message,
    createdAt: new Date().toISOString(),
  };

  saveContactMessages([message, ...getContactMessages()]);
  return message;
}

export function updateContactMessage(id, fields) {
  let updatedMessage = null;
  const messages = getContactMessages().map((message) => {
    if (message.id !== id) return message;
    updatedMessage = { ...message, ...fields, id: message.id };
    return updatedMessage;
  });

  if (!updatedMessage) return null;
  saveContactMessages(messages);
  return updatedMessage;
}

export function deleteContactMessage(id) {
  saveContactMessages(getContactMessages().filter((message) => message.id !== id));
}

export function deleteAllContactMessages() {
  saveContactMessages([]);
}
