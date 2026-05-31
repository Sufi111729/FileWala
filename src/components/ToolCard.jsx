import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n.jsx';

const cardColors = {
  Resize: {
    text: 'text-blue-700',
    softBg: 'bg-blue-50',
    border: 'hover:border-blue-300',
    ring: 'focus-visible:ring-blue-700',
    iconBg: 'group-hover:bg-blue-50',
  },
  Compress: {
    text: 'text-green-700',
    softBg: 'bg-green-50',
    border: 'hover:border-green-300',
    ring: 'focus-visible:ring-green-700',
    iconBg: 'group-hover:bg-green-50',
  },
  Convert: {
    text: 'text-orange-700',
    softBg: 'bg-orange-50',
    border: 'hover:border-orange-300',
    ring: 'focus-visible:ring-orange-700',
    iconBg: 'group-hover:bg-orange-50',
  },
  'PDF Tools': {
    text: 'text-red-700',
    softBg: 'bg-red-50',
    border: 'hover:border-red-300',
    ring: 'focus-visible:ring-red-700',
    iconBg: 'group-hover:bg-red-50',
  },
  'Image Tools': {
    text: 'text-purple-700',
    softBg: 'bg-purple-50',
    border: 'hover:border-purple-300',
    ring: 'focus-visible:ring-purple-700',
    iconBg: 'group-hover:bg-purple-50',
  },
  Documents: {
    text: 'text-cyan-700',
    softBg: 'bg-cyan-50',
    border: 'hover:border-cyan-300',
    ring: 'focus-visible:ring-cyan-700',
    iconBg: 'group-hover:bg-cyan-50',
  },
  'All Tools': {
    text: 'text-black',
    softBg: 'bg-black/5',
    border: 'hover:border-black',
    ring: 'focus-visible:ring-black',
    iconBg: 'group-hover:bg-black/5',
  },
  'Passport Tools': {
    text: 'text-cyan-700',
    softBg: 'bg-cyan-50',
    border: 'hover:border-cyan-300',
    ring: 'focus-visible:ring-cyan-700',
    iconBg: 'group-hover:bg-cyan-50',
  },
};

function ToolCard({ tool, activeTab = 'All Tools' }) {
  const { text } = useLanguage();
  const Icon = tool.icon;
  const translatedTool = text.tools?.[tool.slug] ?? [tool.title, tool.description];
  const colorKey =
    activeTab === 'All Tools'
      ? tool.groups?.find((group) => cardColors[group]) ?? tool.category
      : activeTab;
  const color = cardColors[colorKey] ?? cardColors['All Tools'];

  return (
    <Link
      to={tool.href ?? `/tools/${tool.slug}`}
      className={`group block h-full rounded-lg border border-black/10 bg-white p-5 shadow-sm transition-colors duration-150 ${color.border} hover:bg-white focus:outline-none focus-visible:ring-2 ${color.ring} focus-visible:ring-offset-2`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white transition-colors duration-150 ${color.iconBg}`}>
            <Icon className={`h-6 w-6 ${color.text} transition-transform duration-150 group-hover:scale-125`} />
          </span>
          <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${color.softBg} ${color.text}`}>
            {(text.categories[tool.category] ?? tool.category).replace(' Tools', '')}
          </span>
        </div>

        <h3 className="mt-5 text-base font-black tracking-tight text-black">{translatedTool[0]}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-black/60">{translatedTool[1]}</p>

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-black">
          {text.common.openTool}
          <ArrowRight className={`h-4 w-4 ${color.text}`} />
        </span>
      </div>
    </Link>
  );
}

export default memo(ToolCard);
