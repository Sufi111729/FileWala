import { useMemo } from 'react';
import ToolCard from './ToolCard.jsx';
import CategoryTabs from './navigation/CategoryTabs.jsx';
import { allTools } from '../data/tools.js';
import { keywordMapBySlug } from '../data/seoKeywords.js';
import { useLanguage } from '../i18n.jsx';

export default function ToolGrid({ searchTerm, activeTab, onTabChange }) {
  const { text } = useLanguage();
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredTools = useMemo(
    () => allTools.filter((tool) => {
      const matchesTab = activeTab === 'All Tools' || tool.groups?.includes(activeTab) || tool.category === activeTab;
      const matchesSearch =
        !normalizedSearch ||
        [tool.title, tool.description, tool.category, ...(tool.groups ?? []), ...(tool.keywords ?? []), ...(keywordMapBySlug[tool.slug] ?? [])].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );

      return matchesTab && matchesSearch;
    }),
    [activeTab, normalizedSearch],
  );

  return (
    <section id="tools" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-wide text-black/70">{text.grid.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-black">
              {text.grid.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-black/60">
              {text.grid.description}
            </p>
          </div>
          <p className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black/60">
            {filteredTools.length} {filteredTools.length === 1 ? text.grid.tool : text.grid.tools} {text.grid.found}
          </p>
        </div>

        <div className="mt-7">
          <CategoryTabs activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {filteredTools.length > 0 ? (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.slug} tool={tool} activeTab={activeTab} eagerPreview={index < 4} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-md border border-dashed border-black/20 bg-white px-6 py-14 text-center">
            <h3 className="text-xl font-black text-black">{text.grid.noTools}</h3>
            <p className="mt-2 text-sm text-black/60">{text.grid.searchHint}</p>
          </div>
        )}
      </div>
    </section>
  );
}
