import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FileImage,
  FileText,
  GraduationCap,
  Laptop,
  Layers,
  Lightbulb,
  LockKeyhole,
  Mail,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  UsersRound,
  Wand2,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import { breadcrumbSchema, webPageSchema } from '../../components/seo/schema.js';
import { absoluteUrl, SITE_URL } from '../../data/siteMetadata.js';
import founderImage from '../../assets/contact/founder.webp';

const metaTitle = 'About FileWalaTool - Free Image, PDF & Document Tools';
const metaDescription = 'Learn about FileWalaTool, an online platform for PDF editing, image processing, document preparation, and file conversion. Built to make everyday file tasks simple and accessible.';
const canonicalPath = '/about';

const missionCards = [
  ['Simple workflows', 'Make file tasks clear enough for first-time users and fast enough for repeat work.', Sparkles],
  ['Accessible tools', 'Keep useful PDF, image, and document tools available online without complex setup.', UsersRound],
  ['Reliable performance', 'Build lightweight tools that help users complete common file tasks quickly.', Zap],
  ['Privacy-aware design', 'Use browser-first processing where practical and avoid unnecessary friction around files.', ShieldCheck],
];

const serviceCards = [
  {
    title: 'PDF Tools',
    count: '8 tools',
    icon: FileText,
    description: 'Organize, convert, compress, and adjust PDF files for school, office, business, and everyday document work.',
    tools: ['Merge PDF', 'Split PDF', 'Compress PDF', 'PDF to JPG', 'PDF Rotate', 'PDF Page Delete', 'Word to PDF', 'PDF to Word'],
  },
  {
    title: 'Image Tools',
    count: '6 tools',
    icon: FileImage,
    description: 'Prepare images for uploads, forms, websites, profiles, and file-size requirements with focused utilities.',
    tools: ['Background Remover', 'Image KB Resizer', 'Image Upscaler', 'Image Downscaler', 'JPG to PNG', 'PNG to JPG'],
  },
  {
    title: 'Document Tools',
    count: '6 tools',
    icon: ScanLine,
    description: 'Create upload-ready photos, signatures, resumes, and scanned document files for practical online submissions.',
    tools: ['Passport Photo Maker', 'Aadhaar Photo Resize', 'PAN Photo Resize', 'Signature Resize', 'Resume Builder', 'Document Scanner'],
  },
];

const benefits = [
  ['Fast Processing', 'Complete everyday file tasks with a focused workflow and fewer unnecessary steps.', Clock3],
  ['Mobile Friendly', 'Use FileWalaTool comfortably on phones, tablets, laptops, and desktops.', Smartphone],
  ['Secure Workflow', 'Process files with a user-focused approach and clear, practical controls.', LockKeyhole],
  ['Easy To Use', 'Simple pages guide users from upload to download without technical confusion.', CheckCircle2],
  ['Browser Based', 'Open the tools online and work without installing heavy desktop software.', Laptop],
  ['Regular Updates', 'The platform keeps improving with better tools, clearer pages, and smoother flows.', RefreshCw],
  ['No Complex Setup', 'Most tasks start right away from the browser with no long onboarding process.', Wand2],
  ['Beginner Friendly', 'Built for people who need results, not complicated software menus.', BadgeCheck],
];

const userTypes = [
  ['Students', 'Resize images, merge PDFs, prepare assignments, and submit documents in accepted formats.', GraduationCap],
  ['Job Seekers', 'Prepare resumes, passport photos, signatures, and compressed files for applications.', BriefcaseBusiness],
  ['Government Form Applicants', 'Create upload-ready photos and documents for common form requirements.', FileText],
  ['Office Professionals', 'Compress, merge, split, rotate, and convert files for daily document handling.', Building2],
  ['Freelancers', 'Quickly adjust client files, images, PDFs, and document attachments from one place.', UserRound],
  ['Small Businesses', 'Handle common file conversion and document preparation tasks without extra tools.', UsersRound],
];

const stats = [
  ['20+', 'Online Tools'],
  ['Fast', 'Browser-Based Processing'],
  ['Mobile', 'Friendly Experience'],
  ['Secure', 'File Handling'],
];

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-red">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-black/60">{description}</p>}
    </div>
  );
}

function IconCard({ title, description, icon: Icon }) {
  return (
    <article className="h-full rounded-md border border-black/10 bg-white p-5 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-brand-red ring-1 ring-red-100">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-black text-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-black/60">{description}</p>
    </article>
  );
}

export default function AboutUs() {
  const canonical = absoluteUrl(canonicalPath);
  const jsonLd = [
    webPageSchema({ name: 'About FileWalaTool', description: metaDescription, path: canonicalPath }),
    breadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'About FileWalaTool', url: canonical },
    ]),
  ];

  return (
    <>
      <SeoHelmet
        title={metaTitle}
        description={metaDescription}
        canonical={canonical}
        keywords={['FileWalaTool', 'about FileWalaTool', 'PDF tools', 'image tools', 'document tools', 'file conversion']}
        jsonLd={jsonLd}
      />

      <main className="bg-white text-black">
        <section className="relative overflow-hidden border-b border-black/10 bg-white py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-red-50 to-white" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-brand-red shadow-sm">
                <Sparkles className="h-4 w-4" />
                FileWalaTool
              </p>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-black sm:text-5xl lg:text-6xl">
                About FileWalaTool
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-xl font-bold leading-8 text-black/75">
                Making Image, PDF, and Document Processing Simple for Everyone.
              </p>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-black/60 sm:text-lg">
                FileWalaTool is an online platform that helps people resize images, edit PDFs, convert files, prepare documents, and complete everyday file-related tasks quickly. It brings practical tools into one clean workspace so users can move from upload to download with confidence.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/#tools" className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-black text-white hover:bg-black/85">
                  Explore Tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact-us" className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-6 py-3 text-sm font-black text-black hover:border-brand-red hover:text-brand-red">
                  Contact Us
                  <Mail className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-red">Our Story</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">Our Story</h2>
            </div>
            <div className="grid gap-5 text-base leading-8 text-black/65">
              <p>FileWalaTool started from a real-world problem: simple file tasks often become stressful at the exact moment people need them finished. A student may need to compress a document before an exam form deadline. A job seeker may need a passport photo, signature, and resume in the correct format. An office professional may need to merge a few PDFs quickly before sending a report.</p>
              <p>Many users do not want advanced editing software for these tasks. They need a clean online tool that opens fast, explains the next step clearly, and gives them a file they can use. Existing solutions can feel heavy, confusing, slow, or filled with unnecessary screens before the actual work begins.</p>
              <p>FileWalaTool was created to make these everyday tasks easier. The idea was to build a practical platform where PDF editing, image resizing, document scanning, format conversion, and upload-ready document preparation could sit together in one reliable place.</p>
              <p>The platform is designed for students, professionals, job seekers, freelancers, small businesses, and everyday users who may not have time to learn complex software. Every page is built around a direct workflow: choose the tool, upload the file, adjust when needed, process, and download.</p>
              <p>Our goal is to save users time and reduce frustration. FileWalaTool is not trying to make file processing look complicated. It is built to make useful digital work feel clear, accessible, and less stressful for people who simply need to get something done.</p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Our Mission"
              title="Our Mission"
              description="We want to make document processing simple, accessible, and dependable for users who need practical tools without a complicated learning curve."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {missionCards.map(([title, description, Icon]) => (
                <IconCard key={title} title={title} description={description} icon={Icon} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Tools"
              title="What We Offer"
              description="FileWalaTool brings together PDF, image, and document utilities for common upload, conversion, and preparation needs."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {serviceCards.map(({ title, count, icon: Icon, description, tools }) => (
                <article key={title} className="flex h-full flex-col rounded-md border border-black/10 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-brand-red ring-1 ring-red-100">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">{count}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-black text-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/60">{description}</p>
                  <ul className="mt-5 grid gap-2 text-sm font-bold text-black/70">
                    {tools.map((tool) => (
                      <li key={tool} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-none text-brand-red" />
                        {tool}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Benefits" title="Why Choose FileWalaTool?" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(([title, description, Icon]) => (
                <IconCard key={title} title={title} description={description} icon={Icon} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Users"
              title="Built for Real People"
              description="FileWalaTool is shaped around everyday tasks people actually face while studying, applying, working, or running a small operation."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {userTypes.map(([title, description, Icon]) => (
                <IconCard key={title} title={title} description={description} icon={Icon} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-red">Founder</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">Meet the Founder</h2>
              <p className="mt-4 text-base leading-7 text-black/60">
                FileWalaTool is built with a practical software mindset: solve clear problems, keep the interface usable, and improve the product steadily.
              </p>
            </div>
            <article className="grid gap-6 rounded-md border border-black/10 bg-white p-6 shadow-sm sm:grid-cols-[180px_1fr]">
              <div className="aspect-square overflow-hidden rounded-md border border-black/10 bg-gray-50">
                <img
                  src={founderImage}
                  alt="Muhammad Sufiyan, Founder and Developer of FileWalaTool"
                  title="Muhammad Sufiyan - Founder of FileWalaTool"
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black">Muhammad Sufiyan</h3>
                <p className="mt-1 text-sm font-black uppercase tracking-wide text-brand-red">Founder & Developer</p>
                <p className="mt-4 text-base leading-7 text-black/65">
                  Muhammad Sufiyan is a Full Stack Java Developer and the creator of FileWalaTool. He studied at Technocrats Institute of Technology (TIT), Bhopal, and completed Java Full Stack Development training from JSpiders Bengaluru.
                </p>
                <p className="mt-4 text-base leading-7 text-black/65">
                  His focus is building useful software that solves practical problems for real users. FileWalaTool reflects that approach: simple tools, clear workflows, and steady improvement based on what people need while handling files online.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-red">Future</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">Our Vision</h2>
            </div>
            <div className="grid gap-5 text-base leading-8 text-black/65">
              <p>Our vision is to build FileWalaTool into one of the most trusted online document platforms for everyday users. Trust comes from clarity, consistency, and useful results, so the platform will continue to focus on tools that solve real file problems without making users feel lost.</p>
              <p>We plan to expand PDF, image, and document tools with more conversion options, better editing workflows, and cleaner support for common upload requirements. The goal is to keep adding capability while preserving the simplicity that makes the platform useful.</p>
              <p>User experience will remain a major priority. That means clearer instructions, better mobile layouts, faster pages, improved error handling, and interfaces that help users understand exactly what will happen to their files before they process them.</p>
              <p>Over time, FileWalaTool may introduce smarter automation and AI-powered features where they genuinely help users, such as document cleanup, image preparation, and workflow suggestions. These additions should support the user instead of making the product feel complicated.</p>
              <p>FileWalaTool is being built for users worldwide. Whether someone is preparing a school form, applying for a job, organizing office documents, or managing files for a small business, the vision is to make dependable file processing available from a simple browser-based platform.</p>
            </div>
          </div>
        </section>

        <section className="bg-black py-12 text-white sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map(([value, label]) => (
              <article key={label} className="rounded-md border border-white/10 bg-white/[0.06] p-6">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="mt-2 text-sm font-bold text-white/65">{label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-red">Trust & Privacy</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">Your Privacy Matters</h2>
            </div>
            <div className="rounded-md border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-base leading-8 text-black/65">
                FileWalaTool is built with a browser-first approach wherever practical, so many tasks can be handled directly in the user experience without unnecessary complexity. We focus on clear controls, secure-feeling workflows, and honest communication about what each tool does.
              </p>
              <p className="mt-4 text-base leading-8 text-black/65">
                We do not make unrealistic claims. Instead, we keep improving the platform, review how users interact with tools, and work toward safer, simpler, and more reliable file handling. Users should always be careful with sensitive documents, and FileWalaTool will continue improving the experience with trust as a core product value.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <div className="rounded-md border border-black/10 bg-white p-8 shadow-sm sm:p-10">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-brand-red ring-1 ring-red-100">
                <Lightbulb className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-black sm:text-4xl">Let's Build Something Better Together</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/60">
                We welcome feedback, suggestions, and ideas that help improve FileWalaTool.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/contact-us" className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-black text-white hover:bg-black/85">
                  Contact Us
                  <Mail className="h-4 w-4" />
                </Link>
                <Link to="/#tools" className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-6 py-3 text-sm font-black text-black hover:border-brand-red hover:text-brand-red">
                  Explore Tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
