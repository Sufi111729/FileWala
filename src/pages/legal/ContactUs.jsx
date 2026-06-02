import { useState } from 'react';
import {
  AtSign,
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  UserRound,
} from 'lucide-react';
import developerImage from '../../assets/contact/devloper.jpeg';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import { breadcrumbSchema, webPageSchema } from '../../components/seo/schema.js';
import { SITE_URL } from '../../data/siteMetadata.js';

const metaTitle = 'Contact Muhammad Sufiyan Dev - FileWalaTool Developer';
const metaDescription = 'Contact Muhammad Sufiyan Dev, creator of FileWalaTool, for support, feedback, suggestions, web development, image tools, PDF tools, and online file solutions.';
const ogTitle = 'Contact Muhammad Sufiyan Dev - FileWalaTool';
const ogDescription = 'Get in touch with Muhammad Sufiyan Dev for FileWalaTool support, feedback, suggestions, and online image or PDF tool related queries.';
const canonicalUrl = 'https://filewalatool.com/contact';
const ogImage = 'https://filewalatool.com/assets/contact/devloper.jpeg';

const contactKeywords = [
  'Muhammad Sufiyan Dev',
  'Muhammad Sufiyan developer',
  'MD Sufi developer',
  'mdsufidev',
  'MD Sufi',
  'Muhammad Sufiyan',
  'FileWalaTool developer',
  'FileWalaTool founder',
  'FileWalaTool creator',
  'FileWalaTool support',
  'contact FileWalaTool',
  'contact Muhammad Sufiyan',
  'contact MD Sufi',
  'image tools developer',
  'PDF tools developer',
  'online tools developer',
  'web app developer',
  'full stack developer',
  'React developer',
  'Vite developer',
  'Tailwind CSS developer',
  'Java developer',
  'Spring Boot developer',
  'MySQL developer',
  'frontend developer',
  'backend developer',
  'website developer',
  'SaaS web app developer',
  'online file tools',
  'free online tools',
  'image resize tool',
  'PDF merge tool',
  'PDF split tool',
  'PDF compress tool',
  'image compressor',
  'image converter',
  'JPG to PDF tool',
  'PNG to JPG tool',
  'JPG to PNG tool',
  'background remover tool',
  'passport photo tool',
  'document photo editor',
  'online PDF tools',
  'online image tools',
  'file converter tools',
  'FileWalaTool contact',
  'FileWalaTool feedback',
  'FileWalaTool help',
  'FileWalaTool support team',
  'FileWalaTool developer contact',
  'Muhammad Sufiyan portfolio',
  'Muhammad Sufiyan web developer',
  'Muhammad Sufiyan full stack developer',
  'MD Sufi portfolio',
  'MD Sufi web developer',
  'MD Sufi full stack developer',
  'mdsufidev contact',
  'mdsufidev portfolio',
  'mdsufidev developer',
  'Indian web developer',
  'Bhopal developer',
  'Bhojpur developer',
  'online document tools',
  'document resize tool',
  'PAN photo resize',
  'Aadhaar photo resize',
  'signature resize tool',
  'image to 20KB',
  'image to 50KB',
  'image to 100KB',
  'KB image resizer',
  'PDF to JPG tool',
  'rotate PDF tool',
  'delete PDF pages',
  'merge PDF online',
  'split PDF online',
  'compress PDF online',
  'convert image to PDF',
  'online file editor',
  'file management tools',
  'free PDF converter',
  'free image converter',
  'fast file tools',
  'secure file tools',
  'mobile friendly file tools',
  'browser based tools',
  'no install file tools',
  'instant download tools',
  'privacy friendly tools',
  'web based image editor',
  'web based PDF editor',
  'FileWalaTool online',
  'FileWalaTool India',
  'FileWalaTool official',
  'FileWalaTool website',
  'Muhammad Sufiyan official',
  'MD Sufi official',
  'developer contact page',
  'support contact page',
  'online tool support',
];

const socialLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mdsufidev',
    icon: Linkedin,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/mdsufidev',
    icon: Instagram,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1Z9M2bAdvo/',
    icon: Facebook,
  },
  {
    label: 'WhatsApp Channel',
    href: 'https://whatsapp.com/channel/0029VbCxz06HFxOyxdufyQ3G',
    icon: MessageCircle,
  },
];

const contactDetails = [
  {
    label: 'Name',
    value: 'MD Sufi',
    icon: UserRound,
  },
  {
    label: 'Email',
    value: 'sufi111729@gmail.com',
    href: 'mailto:sufi111729@gmail.com',
    icon: AtSign,
  },
  {
    label: 'Brand',
    value: 'FileWalaTool',
    icon: Building2,
  },
];

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const faqs = [
  {
    question: 'Who is Muhammad Sufiyan Dev?',
    answer: 'Muhammad Sufiyan Dev, also known as MD Sufi or mdsufidev, is the developer of FileWalaTool.',
  },
  {
    question: 'What is FileWalaTool?',
    answer: 'FileWalaTool is an online platform for image tools, PDF tools, file converters, compressors, resizers, and document photo editing tools.',
  },
  {
    question: 'How can I contact FileWalaTool?',
    answer: 'You can contact FileWalaTool through the contact form, email, and official social media links available on this page.',
  },
  {
    question: 'Can I send feedback or suggestions?',
    answer: 'Yes, you can send feedback, feature requests, bug reports, and suggestions through the Contact Us form.',
  },
];

export default function ContactUs() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name) {
      setError('Please enter your name.');
      setStatus('');
      return;
    }

    if (!email || !emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      setStatus('');
      return;
    }

    if (!message) {
      setError('Please enter your message.');
      setStatus('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setStatus('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: form.subject.trim(),
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Could not send your message right now.');
      }

      setForm(initialForm);
      setStatus('Thank you for contacting FileWalaTool. We will get back to you soon.');
    } catch (caughtError) {
      setError(caughtError.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canonical = canonicalUrl;
  const jsonLd = [
    webPageSchema({ name: 'Contact FileWalaTool', description: metaDescription, path: '/contact' }),
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Contact FileWalaTool', url: canonical },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Muhammad Sufiyan',
      alternateName: ['MD Sufi', 'mdsufidev', 'Muhammad Sufiyan Dev'],
      jobTitle: 'Developer',
      url: canonical,
      image: ogImage,
      sameAs: [
        'https://www.linkedin.com/in/mdsufidev',
        'https://www.instagram.com/mdsufidev',
        'https://www.facebook.com/share/1Z9M2bAdvo/',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'FileWalaTool',
      url: SITE_URL,
      founder: {
        '@type': 'Person',
        name: 'Muhammad Sufiyan',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact FileWalaTool',
      url: canonical,
      description: metaDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <SeoHelmet
        title={metaTitle}
        description={metaDescription}
        canonical={canonical}
        image={ogImage}
        ogTitle={ogTitle}
        ogDescription={ogDescription}
        keywords={contactKeywords}
        jsonLd={jsonLd}
      />

      <main className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="grid gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-blue-700">Contact FileWalaTool</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">
                  Get in Touch with FileWalaTool
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-black/65 sm:text-lg sm:leading-8">
                  Have a question, suggestion, or feedback? We are here to help you with image tools, PDF tools, online file tools, and browser-based file solutions.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {contactDetails.map((detail) => {
                  const Icon = detail.icon;
                  const content = (
                    <>
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-red ring-1 ring-black/10">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-xs font-black uppercase tracking-wide text-black/50">{detail.label}</span>
                        <span className="mt-1 block break-words text-sm font-black text-black">{detail.value}</span>
                      </span>
                    </>
                  );

                  if (detail.href) {
                    return (
                      <a
                        key={detail.label}
                        href={detail.href}
                        className="focus-ring flex gap-3 rounded-md border border-black/10 bg-white p-4 shadow-sm hover:border-blue-400"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <article key={detail.label} className="flex gap-3 rounded-md border border-black/10 bg-white p-4 shadow-sm">
                      {content}
                    </article>
                  );
                })}
              </div>

              <section className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-black tracking-tight text-black">Connect With Us</h2>
                <p className="mt-2 text-sm leading-6 text-black/65">
                  Follow FileWalaTool updates, share feedback, or reach out for collaboration through our official social profiles.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open FileWalaTool ${link.label} profile in a new tab`}
                        className="focus-ring flex items-center gap-3 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-black"
                      >
                        <Icon className="h-5 w-5 text-brand-red" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
              <div className="flex min-h-[430px] items-center justify-center overflow-hidden rounded-[22px] bg-white lg:min-h-[560px]">
                <img
                  src={developerImage}
                  alt="Muhammad Sufiyan Dev, MD Sufi - FileWalaTool Developer"
                  width="1254"
                  height="1254"
                  className="h-full max-h-[430px] w-full object-contain object-center lg:max-h-[560px]"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="mt-3 rounded-md border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-base font-black text-black">MD Sufi</p>
                <p className="mt-1 text-sm font-bold text-black/60">Developer of FileWalaTool</p>
              </div>
            </aside>
          </section>

          <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="grid gap-6">
              <section className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-2xl font-black tracking-tight text-black">About Muhammad Sufiyan Dev</h2>
                <p className="mt-3 text-base leading-7 text-black/65">
                  Muhammad Sufiyan Dev, also known as MD Sufi or mdsufidev, is the developer and creator of FileWalaTool, an online platform for image tools, PDF tools, document photo editing, file conversion, compression, resizing, and browser-based file processing. For support, feedback, suggestions, or development related queries, you can contact FileWalaTool through this page.
                </p>
                <p className="mt-3 text-sm leading-6 text-black/60">
                  The FileWalaTool website is built for fast file tools, mobile friendly file tools, privacy friendly tools, and no install file tools such as image resize, image compressor, JPG to PDF, PDF merge, PDF split, PDF compress, PDF to JPG, rotate PDF, delete PDF pages, passport photo, Aadhaar photo resize, PAN photo resize, signature resize, and KB image resizer tools.
                </p>
              </section>

              <section className="rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-2xl font-black tracking-tight text-black">FAQ</h2>
                <div className="mt-4 grid gap-4">
                  {faqs.map((faq) => (
                    <article key={faq.question} className="rounded-md border border-black/10 bg-black/[0.015] p-4">
                      <h3 className="text-base font-black text-black">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-black/65">{faq.answer}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-black/10 bg-black/[0.015] p-5 sm:p-6">
              <h2 className="text-2xl font-black tracking-tight text-black">We Value Your Feedback</h2>
              <p className="mt-3 text-base leading-7 text-black/65">
                FileWalaTool is built to make everyday file work faster and easier for students, job applicants, office users, business users, and anyone who needs quick online image tools, online PDF tools, file converter tools, free image converter tools, and free PDF converter tools. Your messages help us improve the tools and fix issues faster.
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-md border border-black/10 bg-white p-4">
                <Mail className="h-5 w-5 flex-none text-brand-red" />
                <p className="text-sm font-bold leading-6 text-black/65">
                  For direct queries, email <a className="text-blue-700 hover:text-blue-800" href="mailto:sufi111729@gmail.com">sufi111729@gmail.com</a>.
                </p>
              </div>
              </section>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 rounded-md border border-black/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-2xl font-black tracking-tight text-black">Send a Message</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-black/70">
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-black/70">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                    autoComplete="email"
                    required
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-bold text-black/70">
                Subject
                <input
                  type="text"
                  value={form.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                  autoComplete="off"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-black/70">
                Message
                <textarea
                  rows={7}
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  className="focus-ring resize-y rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                  required
                />
              </label>
              {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
              {status && <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{status}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
