import { useEffect, useState } from 'react';
import { LogOut, RefreshCw, Send, Trash2 } from 'lucide-react';

const loginInitial = {
  username: '',
  password: '',
};

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ContactMessagesAdmin() {
  const [login, setLogin] = useState(loginInitial);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateLogin = (name, value) => {
    setLogin((current) => ({ ...current, [name]: value }));
  };

  const loadMessages = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/contact-messages', {
        credentials: 'include',
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setMessages([]);
        return;
      }

      if (!response.ok) throw new Error('Could not load contact messages.');

      const data = await response.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setIsAuthenticated(true);
    } catch (caughtError) {
      setError(caughtError.message || 'Could not load contact messages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(login),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Login failed.');
      }

      setLogin(loginInitial);
      setIsAuthenticated(true);
      setStatus('Logged in successfully.');
      await loadMessages();
    } catch (caughtError) {
      setError(caughtError.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    setIsAuthenticated(false);
    setMessages([]);
    setStatus('');
    setError('');
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    setError('');
    setStatus('');

    try {
      const response = await fetch(`/api/admin/contact-messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Could not delete this message.');

      setMessages((current) => current.filter((message) => message.id !== id));
      setStatus('Message deleted.');
    } catch (caughtError) {
      setError(caughtError.message || 'Could not delete this message.');
    }
  };

  const deleteAllMessages = async () => {
    if (!messages.length || !window.confirm('Are you sure you want to delete all messages?')) return;

    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/admin/contact-messages', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Could not delete all messages.');

      setMessages([]);
      setStatus('All messages deleted.');
    } catch (caughtError) {
      setError(caughtError.message || 'Could not delete all messages.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Private Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black">Contact Messages Login</h1>
            <p className="mt-3 text-sm leading-6 text-black/65">
              Sign in to view private FileWalaTool contact messages.
            </p>
            <form onSubmit={handleLogin} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-black/70">
                ID / Username
                <input
                  type="text"
                  value={login.username}
                  onChange={(event) => updateLogin('username', event.target.value)}
                  className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black/70">
                Password
                <input
                  type="password"
                  value={login.password}
                  onChange={(event) => updateLogin('password', event.target.value)}
                  className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                  autoComplete="current-password"
                  required
                />
              </label>
              {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Send className="h-4 w-4" />
                {isLoading ? 'Checking...' : 'Login'}
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
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Private Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">Contact Messages Dashboard</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/65">
              Latest contact form submissions appear first. Messages older than 5 days are removed automatically when this list is loaded.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadMessages}
              disabled={isLoading}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-black hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-black/40"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-black hover:border-blue-400 hover:text-blue-700"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-black tracking-tight text-black">Messages</h2>
            <button
              type="button"
              onClick={deleteAllMessages}
              disabled={!messages.length}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/30"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </button>
          </div>

          {messages.length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-black/20 bg-white px-5 py-10 text-center text-sm font-bold text-black/60">
              No contact messages yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {messages.map((message) => (
                <article key={message.id} className="rounded-md border border-black/10 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h2 className="text-base font-black text-black">{message.name}</h2>
                        <a className="text-sm font-bold text-blue-700 hover:text-blue-800" href={`mailto:${message.email}`}>
                          {message.email}
                        </a>
                      </div>
                      {message.subject && <p className="mt-2 text-sm font-black text-black/70">{message.subject}</p>}
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/65">{message.message}</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-black/45">{formatDate(message.createdAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMessage(message.id)}
                      className="focus-ring inline-flex w-fit items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
