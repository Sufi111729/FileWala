import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n.jsx';

export const categoryTabs = ['All Tools', 'Resize', 'Compress', 'Convert', 'PDF Tools', 'Image Tools', 'Documents'];

const tabColors = {
  'All Tools': {
    active: 'border-black bg-black text-white',
    idle: 'border-black/10 bg-white text-black shadow-sm hover:border-black/30',
  },
  Resize: {
    active: 'border-blue-700 bg-blue-700 text-white',
    idle: 'border-blue-200 bg-white text-blue-700 shadow-sm hover:border-blue-300',
  },
  Compress: {
    active: 'border-green-700 bg-green-700 text-white',
    idle: 'border-green-200 bg-white text-green-700 shadow-sm hover:border-green-300',
  },
  Convert: {
    active: 'border-orange-700 bg-orange-700 text-white',
    idle: 'border-orange-200 bg-white text-orange-700 shadow-sm hover:border-orange-300',
  },
  'PDF Tools': {
    active: 'border-red-700 bg-red-700 text-white',
    idle: 'border-red-200 bg-white text-red-700 shadow-sm hover:border-red-300',
  },
  'Image Tools': {
    active: 'border-purple-700 bg-purple-700 text-white',
    idle: 'border-purple-200 bg-white text-purple-700 shadow-sm hover:border-purple-300',
  },
  Documents: {
    active: 'border-cyan-700 bg-cyan-700 text-white',
    idle: 'border-cyan-200 bg-white text-cyan-700 shadow-sm hover:border-cyan-300',
  },
};

export default function CategoryTabs({ activeTab = 'All Tools', onTabChange }) {
  const navigate = useNavigate();
  const { text } = useLanguage();

  const handleTabClick = (tab) => {
    if (tab === 'Documents') {
      navigate('/documents');
      return;
    }

    if (onTabChange) {
      onTabChange(tab);
      return;
    }

    navigate(tab === 'All Tools' ? '/#tools' : `/?category=${encodeURIComponent(tab)}#tools`);
  };

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={activeTab === tab}
            onClick={() => handleTabClick(tab)}
            className={`focus-ring rounded-md border px-3.5 py-2 text-sm font-bold transition-colors duration-150 ${
              activeTab === tab ? `${tabColors[tab].active} shadow-sm` : tabColors[tab].idle
            }`}
          >
            {text.categories[tab] ?? tab}
          </button>
        ))}
      </div>
    </div>
  );
}
