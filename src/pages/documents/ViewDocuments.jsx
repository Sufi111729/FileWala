import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import CategoryTabs from '../../components/navigation/CategoryTabs.jsx';
import ToolCard from '../../components/ToolCard.jsx';
import { allTools } from '../../data/tools.js';
import { useLanguage } from '../../i18n.jsx';

const documentToolTitles = [
  'Passport Photo Maker',
  'Signature Resize',
  'Aadhaar Photo Resize',
  'PAN Photo Resize',
  'Resume Builder',
  'Document Scanner',
];

export default function ViewDocuments() {
  const { text } = useLanguage();
  const documentTools = documentToolTitles
    .map((title) => allTools.find((tool) => tool.title === title))
    .filter(Boolean);

  useEffect(() => {
    document.title = 'Documents - FileWalaTool';
  }, []);

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black">
            <Sparkles className="h-4 w-4 text-brand-red" />
            {text.toolsLibrary.label}
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">
            {text.toolsLibrary.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
            {text.toolsLibrary.documentsDescription}
          </p>
          <p className="mt-6 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black/60">
            {documentTools.length} {text.toolsLibrary.toolsFound}
          </p>
        </div>

        <div className="mt-7">
          <CategoryTabs activeTab="Documents" />
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documentTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} activeTab="Documents" />
          ))}
        </div>
      </div>
    </section>
  );
}
