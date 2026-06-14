import {
  Archive,
  ChevronDown,
  Crop,
  FileText,
  Image as ImageIcon,
  Menu,
  RefreshCw,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { allTools, navTools } from '../data/tools.js';
import { languages, useLanguage } from '../i18n.jsx';

const categoryIcons = {
  'All Tools': FileText,
  Resize: Crop,
  Compress: Archive,
  Convert: RefreshCw,
  'PDF Tools': FileText,
  'Image Tools': ImageIcon,
  Documents: FileText,
};

const categoryColors = {
  'All Tools': {
    text: 'text-black',
    bg: 'bg-black',
    softBg: 'bg-black/5',
    border: 'border-black/10',
    hover: 'hover:bg-black',
  },
  Resize: {
    text: 'text-blue-700',
    bg: 'bg-blue-700',
    softBg: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-50',
    hoverText: 'hover:text-blue-700',
  },
  Compress: {
    text: 'text-green-700',
    bg: 'bg-green-700',
    softBg: 'bg-green-50',
    border: 'border-green-200',
    hover: 'hover:bg-green-50',
    hoverText: 'hover:text-green-700',
  },
  Convert: {
    text: 'text-orange-700',
    bg: 'bg-orange-700',
    softBg: 'bg-orange-50',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-50',
    hoverText: 'hover:text-orange-700',
  },
  'PDF Tools': {
    text: 'text-red-700',
    bg: 'bg-red-700',
    softBg: 'bg-red-50',
    border: 'border-red-200',
    hover: 'hover:bg-red-50',
    hoverText: 'hover:text-red-700',
  },
  'Image Tools': {
    text: 'text-purple-700',
    bg: 'bg-purple-700',
    softBg: 'bg-purple-50',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-50',
    hoverText: 'hover:text-purple-700',
  },
  Documents: {
    text: 'text-cyan-700',
    bg: 'bg-cyan-700',
    softBg: 'bg-cyan-50',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-50',
    hoverText: 'hover:text-cyan-700',
  },
};

const defaultCategoryColor = categoryColors['PDF Tools'];

const toolByTitle = new Map(allTools.map((tool) => [tool.title, tool]));

function ToolIcon({ title, colorClass = 'text-brand-red', className = 'h-4 w-4' }) {
  const Icon = toolByTitle.get(title)?.icon ?? FileText;
  return <Icon className={`${className} ${colorClass}`} aria-hidden="true" strokeWidth={2} />;
}

function translatedToolTitle(title, toolLabels = {}) {
  const slug = toolByTitle.get(title)?.slug;
  return (slug && toolLabels[slug]?.[0]) || title;
}

function CategoryDropdown({ item, labels, toolLabels = {}, viewLabel, onNavigate }) {
  const label = labels[item.label] ?? item.label;
  const color = categoryColors[item.label] ?? defaultCategoryColor;

  return (
    <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2">
      <div className="rounded-lg border border-black/10 bg-white p-2 shadow-soft">
        <Link to={item.href} onClick={onNavigate} className="focus-ring group block rounded-md px-3 py-2.5">
          <span className={`block text-[11px] font-black uppercase tracking-wide ${color.text}`}>{label}</span>
          <span className="mt-1 block text-xs font-semibold text-black/45">
            {viewLabel} {label}
          </span>
        </Link>

        <div className="mt-1 grid gap-0.5">
          {item.tools.map((tool) => (
            <Link
              key={`${item.label}-${tool.title}`}
              to={tool.href}
              onClick={onNavigate}
              className={`focus-ring group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold text-black/70 transition-colors duration-150 ${color.hover} ${color.hoverText}`}
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-white">
                <ToolIcon title={tool.title} colorClass={color.text} className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{translatedToolTitle(tool.title, toolLabels)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopNavItem({ item, isActive, activeMenu, labels, toolLabels, viewLabel, setActiveMenu }) {
  const Icon = categoryIcons[item.label] ?? FileText;
  const isOpen = activeMenu === item.label;
  const label = labels[item.label] ?? item.label;
  const color = categoryColors[item.label] ?? defaultCategoryColor;
  const hasDropdown = item.tools.length > 0;

  if (!hasDropdown) {
    return (
      <Link
        to={item.href}
        className={`focus-ring relative inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-bold transition-colors duration-150 ${
          isActive ? color.text : 'text-black/75 hover:text-black'
        }`}
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${color.border} ${color.softBg}`}>
          <Icon className={`h-4 w-4 ${color.text}`} aria-hidden="true" />
        </span>
        {label}
        <span
          className={`absolute inset-x-2 -bottom-3 h-0.5 rounded-full ${color.bg} transition-opacity duration-150 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setActiveMenu(item.label)}
      onFocus={() => setActiveMenu(item.label)}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setActiveMenu(isOpen ? '' : item.label)}
        className={`focus-ring relative inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-bold transition-colors duration-150 ${
          isActive || isOpen ? color.text : 'text-black/75 hover:text-black'
        }`}
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${color.border} ${color.softBg}`}>
          <Icon className={`h-4 w-4 ${color.text}`} aria-hidden="true" />
        </span>
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
        <span
          className={`absolute inset-x-2 -bottom-3 h-0.5 rounded-full ${color.bg} transition-opacity duration-150 ${
            isActive || isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </button>

      <div
        className={`transition duration-150 ease-out ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        {isOpen && (
          <CategoryDropdown
            item={item}
            labels={labels}
            toolLabels={toolLabels}
            viewLabel={viewLabel}
            onNavigate={() => setActiveMenu('')}
          />
        )}
      </div>
    </div>
  );
}

function MobileNavItem({ item, isActive, labels, toolLabels = {}, viewLabel }) {
  const [isOpen, setIsOpen] = useState(isActive);
  const Icon = categoryIcons[item.label] ?? FileText;
  const label = labels[item.label] ?? item.label;
  const color = categoryColors[item.label] ?? defaultCategoryColor;
  const hasDropdown = item.tools.length > 0;

  if (!hasDropdown) {
    return (
      <Link
        to={item.href}
        className="focus-ring flex items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black shadow-sm"
      >
        <span className={`flex h-8 w-8 items-center justify-center rounded-md border ${color.border} ${color.softBg}`}>
          <Icon className={`h-4 w-4 ${color.text}`} aria-hidden="true" />
        </span>
        {label}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-black/10 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="focus-ring flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-bold text-black"
      >
        <span className="flex items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-md border ${color.border} ${color.softBg}`}>
            <Icon className={`h-4 w-4 ${color.text}`} aria-hidden="true" />
          </span>
          {label}
        </span>
        <ChevronDown className={`h-4 w-4 ${color.text} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-black/10 px-3 py-3">
            <Link
              to={item.href}
              className={`focus-ring mb-2 block rounded-md ${color.bg} px-3 py-2.5 text-sm font-bold text-white`}
            >
              {viewLabel} {label}
            </Link>
            <div className="grid gap-1">
              {item.tools.map((tool) => (
                <Link
                  key={`${item.label}-${tool.title}`}
                  to={tool.href}
                  className={`focus-ring flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-semibold text-black/75 transition-colors duration-150 ${color.hover} ${color.hoverText}`}
                >
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-white">
                    <ToolIcon title={tool.title} colorClass={color.text} />
                  </span>
                  {translatedToolTitle(tool.title, toolLabels)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const scrollFrameRef = useRef(0);
  const { language, setLanguage, text } = useLanguage();
  const location = useLocation();
  const activeCategory = new URLSearchParams(location.search).get('category') ?? '';
  const navbarItems = useMemo(() => navTools, []);

  const activeItem = useMemo(
    () => navbarItems.find((item) => item.label === activeCategory)?.label ?? '',
    [activeCategory, navbarItems],
  );

  useEffect(() => {
    const syncScrolled = () => {
      const nextScrolled = window.scrollY > 8;
      if (scrolledRef.current !== nextScrolled) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
    };

    const handleScroll = () => {
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = 0;
        syncScrolled();
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveMenu('');
  }, [location.pathname, location.search, location.hash]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-150 ${
        scrolled ? 'border-black/10 bg-white shadow-sm' : 'border-black/10 bg-white'
      }`}
    >
      <div className="border-b border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="min-w-0 flex-1 text-center">
            <span className="mr-2 rounded bg-brand-red px-2 py-0.5 text-[11px] font-bold text-white">{text.common.new}</span>
            <span className="align-middle">{text.common.announcement}</span>
          </p>
          <label className="focus-within:ring-2 focus-within:ring-black flex flex-none items-center rounded-md px-2 py-1 text-black/70">
            <span className="sr-only">{text.common.changeLanguage}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="cursor-pointer bg-white text-xs font-semibold text-black outline-none"
              aria-label={text.common.changeLanguage}
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="relative" onMouseLeave={() => setActiveMenu('')}>
        <nav className="relative flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:h-[68px] lg:px-8">
          <Link to="/" className="focus-ring flex min-w-0 items-center rounded-lg" aria-label="FileWalaTool home">
            <picture>
              <source srcSet="/assets/logofilewalatoo-538.webp" type="image/webp" />
              <img
                src="/assets/logofilewalatoo-538.png"
                alt="FileWalaTool"
                width="538"
                height="140"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-9 w-auto max-w-[138px] object-contain sm:h-10 sm:max-w-[154px] lg:h-11 lg:max-w-[170px]"
              />
            </picture>
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            {navbarItems.map((item) => (
              <DesktopNavItem
                key={item.label}
                item={item}
                isActive={activeItem === item.label}
                activeMenu={activeMenu}
                labels={text.categories}
                toolLabels={text.tools}
                viewLabel={text.common.view}
                setActiveMenu={setActiveMenu}
              />
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/about"
              className="focus-ring rounded-md px-3 py-2 text-sm font-bold text-black/65 transition-colors duration-150 hover:bg-black/5 hover:text-black"
            >
              {text.common.about}
            </Link>
            <Link
              to="/contact-us"
              className="focus-ring rounded-md bg-brand-red px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:bg-black"
            >
              {text.common.contact}
            </Link>
          </div>

          <button
            type="button"
            className="focus-ring rounded-md border border-black/10 bg-white p-2 text-brand-red transition-colors duration-150 hover:bg-black hover:text-white lg:hidden"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((value) => !value)}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </div>

      {isMobileOpen && (
        <div className="border-t border-black/10 bg-white px-4 py-4 shadow-sm lg:hidden">
          <div className="grid gap-3">
            {navbarItems.map((item) => (
              <MobileNavItem
                key={item.label}
                item={item}
                isActive={activeItem === item.label}
                labels={text.categories}
                toolLabels={text.tools}
                viewLabel={text.common.view}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              to="/about"
              className="focus-ring rounded-md border border-black/10 px-4 py-3 text-center text-sm font-bold text-black transition-colors duration-150 hover:bg-black hover:text-white"
            >
              {text.common.about}
            </Link>
            <Link
              to="/contact-us"
              className="focus-ring rounded-md bg-brand-red px-4 py-3 text-center text-sm font-bold text-white transition-colors duration-150 hover:bg-black"
            >
              {text.common.contact}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
