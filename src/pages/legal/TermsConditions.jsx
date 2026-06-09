import { Link } from 'react-router-dom';
import InfoPageLayout from '../../components/layouts/InfoPageLayout.jsx';
import { useLanguage } from '../../i18n.jsx';

const sections = [
  ['Acceptance of terms', 'By accessing or using FileWalaTool, you agree to these Terms & Conditions. If you do not agree, please stop using the website and its tools.'],
  ['Use of tools', 'FileWalaTool provides online utilities for images, PDFs, and documents. The tools are intended for lawful, practical file preparation tasks such as resizing, compressing, converting, scanning, and creating documents.'],
  ['User responsibility', 'You are responsible for checking the accuracy, quality, format, size, and suitability of any output downloaded from FileWalaTool before submitting it to a government, business, school, or other platform.'],
  ['File ownership', 'You keep ownership of the files you upload and the outputs you create. FileWalaTool does not claim ownership over your uploaded content.'],
  ['Prohibited usage', 'Do not use FileWalaTool to upload, create, process, or distribute illegal, harmful, abusive, infringing, misleading, or unauthorized content.'],
  ['Service availability', 'We aim to keep FileWalaTool fast and available, but we do not guarantee uninterrupted access. Tools may change, pause, fail, or be removed as the service evolves.'],
  ['Limitation of liability', 'FileWalaTool is provided as a convenience utility. We are not liable for lost files, incorrect outputs, rejected uploads, business losses, or indirect damages resulting from use of the website.'],
  ['Intellectual property', 'The FileWalaTool name, interface, design, text, and code are protected by applicable intellectual property laws. You may not copy or misuse the brand or website materials without permission.'],
  ['External links', 'The website may link to external services or third-party pages. We are not responsible for the content, availability, security, or privacy practices of those external websites.'],
  ['Modifications to service', 'We may update these terms, add or remove tools, adjust limits, or change the website experience when needed. Continued use of FileWalaTool means you accept the updated terms.'],
];

export default function TermsConditions() {
  const { language, text } = useLanguage();
  const localizedSections = language === 'en' ? sections : [
    [text.legal.termsTitle, text.legal.termsDescription],
    [text.sections.fastSecureProcessing, text.toolPage.aboutText],
    [text.sections.privacyFriendly, text.legal.privacyDescription],
    [text.legal.contactSection, text.legal.issueNote],
  ];

  return (
    <InfoPageLayout
      title={text.legal.termsTitle}
      description={text.legal.termsDescription}
      metaTitle={`${text.legal.termsTitle} - FileWalaTool`}
      metaDescription={text.legal.termsDescription}
      canonicalPath="/terms-and-conditions"
    >
      <p className="text-sm font-semibold leading-6 text-black/60">{text.info.lastUpdated}</p>
      <div className="mt-6 grid gap-6">
        {localizedSections.map(([title, body]) => (
          <section key={title}>
            <h2 className="text-xl font-black tracking-tight text-black">{title}</h2>
            <p className="mt-3 text-base leading-7 text-black/65">{body}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-md border border-black/10 bg-black/[0.015] p-5">
        <h2 className="text-xl font-black tracking-tight text-black">{text.legal.contactSection}</h2>
        <p className="mt-3 text-base leading-7 text-black/65">
          {text.legal.contactDescription}{' '}
          <a className="font-bold text-blue-700 hover:text-blue-800" href="mailto:support@filewalatool.com">
            support@filewalatool.com
          </a>{' '}
          <Link className="font-bold text-blue-700 hover:text-blue-800" to="/contact-us">{text.legal.contactTitle}</Link>
        </p>
      </section>
    </InfoPageLayout>
  );
}
