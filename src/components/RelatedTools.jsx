import ToolCard from './ToolCard.jsx';
import { useLanguage } from '../i18n.jsx';

export default function RelatedTools({
  tools = [],
  activeTab = 'All Tools',
  currentSlug,
  title = 'More useful FileWalaTool options',
}) {
  const { text, tLiteral } = useLanguage();
  const relatedTools = (Array.isArray(tools) ? tools : [])
    .filter((tool) => tool?.slug && tool.slug !== currentSlug)
    .slice(0, 4);

  if (relatedTools.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">RELATED TOOLS</p>
          <h2 className="text-2xl font-black text-black">{tLiteral(title)}</h2>
        </div>

        <a href="/#tools" className="text-sm font-bold text-black hover:underline">
          {text.common.viewAllTools}
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {relatedTools.map((tool) => (
          <div key={tool.slug} className="block w-full h-full min-w-0">
            <ToolCard tool={tool} activeTab={activeTab} />
          </div>
        ))}
      </div>
    </section>
  );
}
