import { Link } from 'react-router-dom';
import InfoPageLayout from '../../components/layouts/InfoPageLayout.jsx';
import { useLanguage } from '../../i18n.jsx';

const sections = [
  {
    title: 'Browser-based processing',
    body: [
      'Files are processed securely in your browser whenever possible. Many FileWalaTool image, PDF, and document tools are designed to run locally in your browser so your workflow stays quick and private.',
      'Some tools may require temporary server-side processing in future updates. If that happens, FileWalaTool will use the file only to complete the requested action.',
    ],
  },
  {
    title: 'File privacy and storage',
    body: [
      'We do not permanently store uploaded files. Files selected inside browser-based tools remain part of your active session unless a feature clearly says otherwise.',
      'Temporary files, previews, or processed outputs may be created during a tool session so the app can resize, compress, convert, or prepare your document.',
    ],
  },
  {
    title: 'Cookies and analytics',
    body: [
      'FileWalaTool may use essential cookies or browser storage to keep the site functional and improve the user experience.',
      'We may use analytics tools to understand page performance, popular tools, device types, and general usage patterns. Analytics data is used in aggregated form and is not intended to identify uploaded file content.',
    ],
  },
  {
    title: 'Third-party services and advertising',
    body: [
      'FileWalaTool may use trusted third-party services for hosting, analytics, security, performance monitoring, or advertising.',
      'If ads such as Google AdSense are used, advertising partners may use cookies or similar technologies to show relevant ads and measure performance according to their own privacy policies.',
    ],
  },
  {
    title: 'User responsibility',
    body: [
      'You are responsible for making sure you have the right to upload and process any file you use with FileWalaTool.',
      'Avoid uploading sensitive documents unless you are comfortable using an online tool and have reviewed the risks for your specific use case.',
    ],
  },
  {
    title: 'Security disclaimer',
    body: [
      'We use practical safeguards and privacy-friendly design choices, but no website or browser-based service can guarantee absolute security.',
      'FileWalaTool is provided as a utility service and should not be treated as a certified secure storage or legal recordkeeping platform.',
    ],
  },
];

export default function PrivacyPolicy() {
  const { text } = useLanguage();

  return (
    <InfoPageLayout
      title={text.legal.privacyTitle}
      description={text.legal.privacyDescription}
      metaTitle="Privacy Policy - FileWalaTool"
      metaDescription="Learn how FileWalaTool handles files, privacy, browser-based processing, cookies, analytics, ads, and user responsibility."
    >
      <div className="prose prose-neutral max-w-none">
        <p className="text-sm font-semibold leading-6 text-black/60">{text.info.lastUpdated}</p>
        <div className="mt-6 grid gap-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-black tracking-tight text-black">{section.title}</h2>
              <div className="mt-3 grid gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-black/65">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-md border border-black/10 bg-black/[0.015] p-5">
          <h2 className="text-xl font-black tracking-tight text-black">{text.legal.contactEmail}</h2>
          <p className="mt-3 text-base leading-7 text-black/65">
            For privacy questions, contact us at{' '}
            <a className="font-bold text-blue-700 hover:text-blue-800" href="mailto:support@filewalatool.com">
              support@filewalatool.com
            </a>
            . You can also use the <Link className="font-bold text-blue-700 hover:text-blue-800" to="/contact-us">Contact Us</Link> page.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
