import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import InfoPageLayout from '../../components/layouts/InfoPageLayout.jsx';
import { useLanguage } from '../../i18n.jsx';

const supportEmail = 'support@filewalatool.com';

export default function ContactUs() {
  const { text } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

    if (!form.name.trim() || !emailIsValid || form.message.trim().length < 10) {
      setError(text.legal.validationError);
      return;
    }

    setError('');
    const subject = encodeURIComponent(`FileWalaTool support request from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <InfoPageLayout
      title={text.legal.contactTitle}
      description={text.legal.contactDescription}
      metaTitle="Contact Us - FileWalaTool Support"
      metaDescription="Contact FileWalaTool for support, feedback, business inquiries, tool issues, and product suggestions."
      ctaTitle="Need a tool first?"
      ctaDescription="Most file tasks can be handled directly from the tools library."
      canonicalPath="/contact-us"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-black/70">
            {text.legal.name}
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
              autoComplete="name"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-black/70">
            {text.legal.email}
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
              autoComplete="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-black/70">
            {text.legal.message}
            <textarea
              rows={7}
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              className="focus-ring resize-y rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
            />
          </label>
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
          <button
            type="submit"
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 sm:w-fit"
          >
            <Send className="h-4 w-4" />
            {text.legal.sendMessage}
          </button>
        </form>

        <aside className="grid content-start gap-4">
          <section className="rounded-md border border-black/10 bg-black/[0.015] p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-blue-700 ring-1 ring-black/10">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-xl font-black tracking-tight text-black">{text.legal.contactInfo}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              Email us at{' '}
              <a className="font-bold text-blue-700 hover:text-blue-800" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
              . {text.legal.responseTime}
            </p>
          </section>
          <section className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black tracking-tight text-black">{text.legal.toolIssueDetails}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">
              {text.legal.issueNote}
            </p>
          </section>
        </aside>
      </div>
    </InfoPageLayout>
  );
}
