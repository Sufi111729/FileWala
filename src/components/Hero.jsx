import { CheckCircle2, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { allTools } from '../data/tools.js';
import { useLanguage } from '../i18n.jsx';

const badges = [
  { label: 'Free to use', icon: CheckCircle2 },
  { label: 'Fast processing', icon: Zap },
  { label: 'No signup needed', icon: ShieldCheck },
];

const searchColors = {
  Resize: {
    text: 'text-blue-600',
    softBg: 'bg-blue-50',
    hover: 'hover:bg-blue-50',
  },
  Compress: {
    text: 'text-green-600',
    softBg: 'bg-green-50',
    hover: 'hover:bg-green-50',
  },
  Convert: {
    text: 'text-orange-600',
    softBg: 'bg-orange-50',
    hover: 'hover:bg-orange-50',
  },
  'PDF Tools': {
    text: 'text-red-600',
    softBg: 'bg-red-50',
    hover: 'hover:bg-red-50',
  },
  'Image Tools': {
    text: 'text-purple-600',
    softBg: 'bg-purple-50',
    hover: 'hover:bg-purple-50',
  },
  Documents: {
    text: 'text-cyan-600',
    softBg: 'bg-cyan-50',
    hover: 'hover:bg-cyan-50',
  },
  'Passport Tools': {
    text: 'text-cyan-600',
    softBg: 'bg-cyan-50',
    hover: 'hover:bg-cyan-50',
  },
};

const colorForTool = (tool) => searchColors[tool.groups?.find((group) => searchColors[group])] ?? searchColors[tool.category] ?? searchColors['PDF Tools'];

export default function Hero({ searchTerm, onSearchChange }) {
  const { text, tCategory, tToolTitle, tToolDescription } = useLanguage();
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const suggestedTools = useMemo(() => {
    if (!normalizedSearch) return [];

    return allTools
      .filter((tool) =>
        [tool.title, tool.description, tool.category, ...(tool.groups ?? [])].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      )
      .slice(0, 6);
  }, [normalizedSearch]);

  return (
    <section className="home-hero-section border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black">
          <Sparkles className="h-4 w-4 text-brand-red" />
          {text.hero.eyebrow}
        </div>

        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-black sm:text-5xl">
          Free Online Image &amp; PDF Tools
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
          {text.hero.description}
        </p>

        <div className="mt-7 w-full max-w-2xl">
          <label htmlFor="tool-search" className="sr-only">
            {text.hero.search}
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-black/10 bg-white p-2.5 shadow-sm transition-colors duration-150 focus-within:border-black">
            <Search className="ml-2 h-5 w-5 flex-none text-brand-red" />
            <input
              id="tool-search"
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={text.hero.searchPlaceholder}
              className="min-h-10 w-full bg-transparent text-base font-semibold text-black outline-none placeholder:text-black/40"
            />
          </div>

          {normalizedSearch && (
            <div className="mt-3 overflow-hidden rounded-lg border border-black/10 bg-white text-left shadow-sm">
              {suggestedTools.length > 0 ? (
                <div className="divide-y divide-black/5">
                  {suggestedTools.map((tool) => {
                    const Icon = tool.icon;
                    const color = colorForTool(tool);
                    return (
                      <Link
                        key={tool.slug}
                        to={tool.href ?? `/tools/${tool.slug}`}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors duration-150 ${color.hover} focus:outline-none focus-visible:bg-black/5`}
                      >
                        <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-md ${color.softBg}`}>
                          <Icon className={`h-5 w-5 ${color.text}`} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-black">{tToolTitle(tool)}</span>
                          <span className="block truncate text-xs font-semibold text-black/50">{tToolDescription(tool)}</span>
                        </span>
                        <span className={`hidden rounded-full px-3 py-1 text-xs font-black ${color.softBg} ${color.text} sm:inline-flex`}>
                          {tCategory(tool.category).replace(' Tools', '')}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-5 text-center text-sm font-bold text-black/60">
                  {text.hero.noTools}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black/65"
              >
                <Icon className="h-4 w-4 text-brand-red" />
                {text.hero.badges[index] ?? badge.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
