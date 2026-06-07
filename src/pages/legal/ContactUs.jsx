import { useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import { breadcrumbSchema, webPageSchema } from '../../components/seo/schema.js';
import { SITE_URL } from '../../data/siteMetadata.js';
import { addContactMessage } from '../../utils/contactMessages.js';

const metaTitle = 'Contact FileWalaTool - Support & Feedback';
const metaDescription = 'Contact FileWalaTool for support, feedback, tool issues, copyright concerns, and business queries.';
const canonicalUrl = `${SITE_URL}/contact-us`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mdsufidev', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/mdsufidev', icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1Z9M2bAdvo/', icon: Facebook },
  { label: 'WhatsApp Channel', href: 'https://whatsapp.com/channel/0029VbCxz06HFxOyxdufyQ3G', icon: MessageCircle },
];

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please enter your full name.';
  if (!form.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.message.trim()) errors.message = 'Please enter your message.';
  return errors;
}

function FieldError({ id, children }) {
  if (!children) return null;
  return <p id={id} className="text-xs font-bold text-red-700">{children}</p>;
}

export default function ContactUs() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setStatus('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(form);

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus('');
      setError('Please correct the highlighted fields.');
      return;
    }

    const messageData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    setIsSubmitting(true);
    setFieldErrors({});
    setStatus('');
    setError('');

    try {
      const savedMessage = addContactMessage(messageData);

      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          id: savedMessage.id,
          createdAt: savedMessage.createdAt,
        }),
      }).catch(() => null);

      setForm(initialForm);
      setStatus('Your message has been sent successfully. Thank you for contacting FileWalaTool.');
    } catch {
      setError('We could not save your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const jsonLd = [
    webPageSchema({ name: 'Contact FileWalaTool', description: metaDescription, path: '/contact-us' }),
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Contact FileWalaTool', url: canonicalUrl },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact FileWalaTool',
      url: canonicalUrl,
      description: metaDescription,
    },
  ];

  const inputClass = 'focus-ring w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm font-semibold text-black placeholder:text-black/35 hover:border-black/25';

  return (
    <>
      <SeoHelmet
        title={metaTitle}
        description={metaDescription}
        canonical={canonicalUrl}
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        keywords={['FileWalaTool support', 'contact FileWalaTool', 'tool feedback', 'FileWalaTool help']}
        jsonLd={jsonLd}
      />

      <main className="bg-white">
        <section className="border-b border-black/10 bg-black/[0.015]">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-red">Support & Feedback</p>
            <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-6xl">
              Contact FileWalaTool
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-black/65 sm:text-lg sm:leading-8">
              Have a question, suggestion, or issue? Send us a message and we&apos;ll try to help.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-bold text-black/55 sm:text-sm">
              <span>Fast response</span><span aria-hidden="true">•</span>
              <span>Privacy friendly</span><span aria-hidden="true">•</span>
              <span>User support</span>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] lg:items-start lg:gap-8 lg:px-8">
            <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-black/10 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
              <div className="border-b border-black/10 pb-5">
                <h2 className="text-2xl font-black tracking-tight text-black">Send a Message</h2>
                <p className="mt-2 text-sm leading-6 text-black/60">Fields marked with an asterisk are required.</p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-black/75">
                  Full Name <span className="text-brand-red" aria-hidden="true">*</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                    className={`${inputClass} ${fieldErrors.name ? 'border-red-400' : ''}`}
                  />
                  <FieldError id="contact-name-error">{fieldErrors.name}</FieldError>
                </label>

                <label className="grid gap-2 text-sm font-bold text-black/75">
                  Email Address <span className="text-brand-red" aria-hidden="true">*</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                    className={`${inputClass} ${fieldErrors.email ? 'border-red-400' : ''}`}
                  />
                  <FieldError id="contact-email-error">{fieldErrors.email}</FieldError>
                </label>

                <label className="grid gap-2 text-sm font-bold text-black/75">
                  <span>Phone Number <span className="font-semibold text-black/40">(optional)</span></span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    className={inputClass}
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold text-black/75">
                  <span>Subject <span className="font-semibold text-black/40">(optional)</span></span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) => updateField('subject', event.target.value)}
                    placeholder="What can we help with?"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="mt-5 grid gap-2 text-sm font-bold text-black/75">
                Message <span className="text-brand-red" aria-hidden="true">*</span>
                <textarea
                  rows={7}
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  placeholder="Describe your question, feedback, or issue"
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                  className={`${inputClass} resize-y ${fieldErrors.message ? 'border-red-400' : ''}`}
                />
                <FieldError id="contact-message-error">{fieldErrors.message}</FieldError>
              </label>

              {error && (
                <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </p>
              )}
              {status && (
                <p role="status" className="mt-5 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  {status}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-5 py-3.5 text-sm font-black text-white shadow-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-44"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <aside className="rounded-xl border border-black/10 bg-black/[0.015] p-5 shadow-sm sm:p-7 lg:sticky lg:top-28">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-brand-red ring-1 ring-black/10">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-black">Support</h2>
              <p className="mt-3 text-sm leading-6 text-black/65">
                For tool issues, feedback, copyright concerns, or business queries, send us a message.
              </p>

              <div className="mt-6 grid gap-3 border-y border-black/10 py-5">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 flex-none text-brand-red" />
                  <p className="text-sm font-semibold leading-6 text-black/65">We usually review messages as soon as possible.</p>
                </div>
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-5 w-5 flex-none text-brand-red" />
                  <p className="text-sm font-semibold leading-6 text-black/65">Your details are used only to respond to your request.</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/45">Direct contact</p>
                <a href="mailto:sufi111729@gmail.com" className="focus-ring mt-3 flex items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black hover:border-brand-red hover:text-brand-red">
                  <Mail className="h-4 w-4 flex-none" />
                  <span className="min-w-0 break-all">sufi111729@gmail.com</span>
                </a>
              </div>

              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/45">Connect</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black/70 hover:border-brand-red hover:text-black"
                      >
                        <span className="flex items-center gap-3"><Icon className="h-4 w-4 text-brand-red" />{link.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-black/35" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
