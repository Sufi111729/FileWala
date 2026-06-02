import { Link } from 'react-router-dom';
import { MonitorSmartphone, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import InfoPageLayout from '../../components/layouts/InfoPageLayout.jsx';
import { useLanguage } from '../../i18n.jsx';

const featureIcons = [Zap, ShieldCheck, MonitorSmartphone, Sparkles];

const metaTitle = 'About FileWalaTool - Free Image and PDF Tools';
const metaDescription = 'Learn about FileWalaTool, a free online image and PDF tools website built for fast, simple, privacy-friendly file editing on mobile and desktop.';

const aboutSections = [
  {
    title: 'About FileWalaTool',
    body: [
      'FileWalaTool is a free online tools website built to make everyday file work faster and easier. Many people need to resize an image, compress a photo, merge a PDF, convert JPG to PDF, or prepare a passport photo without installing heavy software. FileWalaTool brings those common tasks into one simple place, so students, job applicants, office workers, business users, and everyday internet users can finish file edits quickly.',
      'Our tools are designed for practical work: online forms, document uploads, email attachments, profile photos, scanned papers, applications, office PDFs, and business files. The goal is not to make file editing complicated. The goal is to give users a clean, reliable workspace that works when they need it.',
    ],
  },
  {
    title: 'Our Mission',
    body: [
      'Our mission is to make useful image and PDF tools accessible to everyone. File editing should not require advanced software knowledge, expensive apps, or long setup steps. FileWalaTool focuses on clear controls, quick processing, and tool pages that are easy to understand even if you are using them for the first time.',
      'We are building FileWalaTool for real daily tasks, from reducing an image size for an exam form to combining PDF documents for office work. Every tool is created with the same idea: upload, adjust, process, and download with as little friction as possible.',
    ],
  },
  {
    title: 'What You Can Do With FileWalaTool',
    body: [
      'FileWalaTool includes tools for image resize, image compress, JPG to PDF, PNG to PDF, image to PDF, merge PDF, split PDF, compress PDF, PDF to JPG, background remover, passport photo maker, and document preparation. These tools help with common file requirements such as changing dimensions, reducing file size, converting formats, preparing upload-ready photos, and organizing PDF pages.',
      'Whether you are preparing a resume attachment, resizing a profile image, compressing a document for email, or creating a PDF from images, FileWalaTool is made to keep the workflow simple and focused.',
    ],
  },
  {
    title: 'Why Users Choose Us',
    body: [
      'People choose FileWalaTool because it is fast, easy to use, and works across mobile and desktop devices. The interface is kept clean so users can find the right tool, understand what to do next, and complete the task without unnecessary distractions.',
      'FileWalaTool is also built with a privacy-friendly approach. Many workflows are designed to run directly in the browser where possible, which helps reduce unnecessary file handling. Users should still review sensitive files carefully and understand each tool before processing important documents, but our direction is clear: keep everyday file tasks simple, practical, and respectful of user trust.',
    ],
  },
  {
    title: 'Our Commitment',
    body: [
      'We are committed to improving FileWalaTool with useful features, better performance, clearer instructions, and dependable tools for everyday file editing. We do not claim fake certifications or make promises that cannot be technically guaranteed. Instead, we focus on building tools that are understandable, lightweight, and helpful for real users.',
      'Use FileWalaTool whenever you need quick image and PDF tasks done without extra complexity. From compressing photos to organizing PDFs, we aim to make daily file work smoother, faster, and easier for everyone.',
    ],
  },
];

export default function AboutUs() {
  const { text } = useLanguage();

  return (
    <InfoPageLayout
      title="About FileWalaTool"
      description="FileWalaTool helps students, job applicants, office workers, business users, and everyday users complete common image and PDF tasks online."
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      ctaTitle={text.home.title}
      ctaDescription={text.info.ctaDescription}
      ctaLabel={text.info.exploreAllTools}
      canonicalPath="/about-us"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-5">
          {aboutSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-black tracking-tight text-black">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-base leading-7 text-black/65">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <Link className="font-black text-blue-700 hover:text-blue-800" to="/privacy-policy">
            {text.common.privacy}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {text.home.features.map(([title, description], index) => {
            const Icon = featureIcons[index] ?? Sparkles;
            return (
            <article key={title} className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-brand-red ring-1 ring-black/10">
                <Icon className="h-5 w-5 text-brand-red" />
              </span>
              <h3 className="mt-5 text-base font-black text-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>
            </article>
            );
          })}
        </div>
      </div>
    </InfoPageLayout>
  );
}
