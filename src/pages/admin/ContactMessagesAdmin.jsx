import { useEffect, useMemo, useState } from 'react';
import { Eye, LockKeyhole, LogOut, Pencil, Search, Trash2, X } from 'lucide-react';
import {
  CONTACT_MESSAGES_STORAGE_KEY,
  CONTACT_MESSAGES_UPDATED_EVENT,
  deleteAllContactMessages,
  deleteContactMessage,
  getContactMessages,
  updateContactMessage,
} from '../../utils/contactMessages.js';

const emptyEditForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTH_STORAGE_KEY = 'filewalatool_contact_dashboard_auth';
const DASHBOARD_ID = 'mdsufi';
const DASHBOARD_PASSWORD = 'mdsufi';

function hasDashboardSession() {
  try {
    return window.sessionStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Unknown date';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function ContactMessagesAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasDashboardSession);
  const [login, setLogin] = useState({ id: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const loadMessages = () => setMessages(getContactMessages());

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    loadMessages();
    const handleStorage = (event) => {
      if (!event.key || event.key === CONTACT_MESSAGES_STORAGE_KEY) loadMessages();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CONTACT_MESSAGES_UPDATED_EVENT, loadMessages);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CONTACT_MESSAGES_UPDATED_EVENT, loadMessages);
    };
  }, [isAuthenticated]);

  const handleLogin = (event) => {
    event.preventDefault();

    if (login.id.trim() !== DASHBOARD_ID || login.password !== DASHBOARD_PASSWORD) {
      setLoginError('Invalid ID or password.');
      return;
    }

    try {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
      setIsAuthenticated(true);
      setLogin({ id: '', password: '' });
      setLoginError('');
    } catch {
      setLoginError('Could not start a dashboard session in this browser.');
    }
  };

  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // State is still cleared when sessionStorage is unavailable.
    }
    setIsAuthenticated(false);
    setMessages([]);
    setSearch('');
    setSelectedId('');
    setEditingId('');
    setEditForm(emptyEditForm);
    setStatus('');
    setError('');
  };

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((message) => (
      [message.name, message.email, message.subject, message.message]
        .some((value) => String(value || '').toLowerCase().includes(query))
    ));
  }, [messages, search]);

  const beginEdit = (message) => {
    setEditingId(message.id);
    setEditForm({
      name: message.name || '',
      email: message.email || '',
      phone: message.phone || '',
      subject: message.subject || '',
      message: message.message || '',
    });
    setStatus('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditForm(emptyEditForm);
    setError('');
  };

  const saveEdit = (event) => {
    event.preventDefault();
    const fields = {
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
      phone: editForm.phone.trim(),
      subject: editForm.subject.trim(),
      message: editForm.message.trim(),
    };

    if (!fields.name || !emailPattern.test(fields.email) || !fields.message) {
      setError('Name, a valid email, and message are required.');
      setStatus('');
      return;
    }

    try {
      updateContactMessage(editingId, fields);
      cancelEdit();
      setStatus('Message updated.');
    } catch {
      setError('Could not update the message in this browser.');
    }
  };

  const removeMessage = (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      deleteContactMessage(id);
      if (selectedId === id) setSelectedId('');
      if (editingId === id) cancelEdit();
      setError('');
      setStatus('Message deleted.');
    } catch {
      setError('Could not delete the message from this browser.');
    }
  };

  const removeAllMessages = () => {
    if (!messages.length || !window.confirm('Are you sure you want to delete all messages?')) return;

    try {
      deleteAllContactMessages();
      setSelectedId('');
      cancelEdit();
      setStatus('All messages deleted.');
    } catch {
      setError('Could not delete the messages from this browser.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-black/[0.03] text-brand-red ring-1 ring-black/10">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-brand-red">Private Access</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black">Contact Dashboard Login</h1>
            <p className="mt-3 text-sm leading-6 text-black/60">Sign in to view and manage submitted contact messages.</p>

            <form onSubmit={handleLogin} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-black/75">
                ID
                <input
                  type="text"
                  value={login.id}
                  onChange={(event) => {
                    setLogin((current) => ({ ...current, id: event.target.value }));
                    setLoginError('');
                  }}
                  autoComplete="username"
                  className="focus-ring rounded-lg border border-black/15 bg-white px-4 py-3 text-sm font-semibold text-black"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black/75">
                Password
                <input
                  type="password"
                  value={login.password}
                  onChange={(event) => {
                    setLogin((current) => ({ ...current, password: event.target.value }));
                    setLoginError('');
                  }}
                  autoComplete="current-password"
                  className="focus-ring rounded-lg border border-black/15 bg-white px-4 py-3 text-sm font-semibold text-black"
                  required
                />
              </label>
              {loginError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{loginError}</p>}
              <button type="submit" className="focus-ring mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-5 py-3 text-sm font-black text-white hover:bg-black">
                <LockKeyhole className="h-4 w-4" />
                Login
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Contact</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">Contact Messages Dashboard</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/65">
              View and manage messages submitted through the Contact Us form on this browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={removeAllMessages}
              disabled={!messages.length}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/30"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-black hover:bg-black hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {(status || error) && (
          <div className="mt-5">
            {status && <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{status}</p>}
            {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
          </div>
        )}

        <div className="mt-7 rounded-md border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <label className="relative block">
            <span className="sr-only">Search contact messages</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, subject, or message"
              className="focus-ring w-full rounded-md border border-black/10 py-3 pl-10 pr-3 text-sm font-semibold text-black"
            />
          </label>

          {filteredMessages.length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-black/20 bg-white px-5 py-10 text-center text-sm font-bold text-black/60">
              No contact messages found.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {filteredMessages.map((message) => {
                const isSelected = selectedId === message.id;
                const isEditing = editingId === message.id;

                return (
                  <article key={message.id} className="rounded-md border border-black/10 bg-white p-4 shadow-sm sm:p-5">
                    {isEditing ? (
                      <form onSubmit={saveEdit} className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="grid gap-2 text-sm font-bold text-black/70">
                            Name
                            <input required value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm font-semibold text-black" />
                          </label>
                          <label className="grid gap-2 text-sm font-bold text-black/70">
                            Email
                            <input required type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm font-semibold text-black" />
                          </label>
                          <label className="grid gap-2 text-sm font-bold text-black/70">
                            Phone
                            <input type="tel" value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm font-semibold text-black" />
                          </label>
                          <label className="grid gap-2 text-sm font-bold text-black/70">
                            Subject
                            <input value={editForm.subject} onChange={(event) => setEditForm((current) => ({ ...current, subject: event.target.value }))} className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm font-semibold text-black" />
                          </label>
                        </div>
                        <label className="grid gap-2 text-sm font-bold text-black/70">
                          Message
                          <textarea required rows={5} value={editForm.message} onChange={(event) => setEditForm((current) => ({ ...current, message: event.target.value }))} className="focus-ring resize-y rounded-md border border-black/10 px-3 py-2.5 text-sm font-semibold text-black" />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button type="submit" className="focus-ring rounded-md bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">Save Changes</button>
                          <button type="button" onClick={cancelEdit} className="focus-ring rounded-md border border-black/10 px-4 py-2.5 text-sm font-bold text-black hover:bg-black/5">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <h2 className="text-base font-black text-black">{message.name}</h2>
                              <a className="break-all text-sm font-bold text-blue-700 hover:text-blue-800" href={`mailto:${message.email}`}>{message.email}</a>
                            </div>
                            {message.subject && <p className="mt-2 text-sm font-black text-black/70">{message.subject}</p>}
                            <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-black/65">{message.message}</p>
                            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-black/45">{formatDate(message.createdAt)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setSelectedId(isSelected ? '' : message.id)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-bold text-black hover:bg-black/5">
                              {isSelected ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              {isSelected ? 'Close' : 'View'}
                            </button>
                            <button type="button" onClick={() => beginEdit(message)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">
                              <Pencil className="h-4 w-4" /> Edit
                            </button>
                            <button type="button" onClick={() => removeMessage(message.id)} className="focus-ring inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-4 rounded-md border border-black/10 bg-black/[0.015] p-4">
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                              <div><dt className="font-black text-black/50">Phone</dt><dd className="mt-1 break-words font-semibold text-black">{message.phone || 'Not provided'}</dd></div>
                              <div><dt className="font-black text-black/50">Created</dt><dd className="mt-1 font-semibold text-black">{formatDate(message.createdAt)}</dd></div>
                              <div className="sm:col-span-2"><dt className="font-black text-black/50">Subject</dt><dd className="mt-1 break-words font-semibold text-black">{message.subject || 'No subject'}</dd></div>
                              <div className="sm:col-span-2"><dt className="font-black text-black/50">Message</dt><dd className="mt-1 whitespace-pre-wrap break-words leading-6 text-black/75">{message.message}</dd></div>
                            </dl>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
