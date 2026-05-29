import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ToolPageLayout({ title, description, children }) {
  return (
    <section className="bg-white py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/documents"
          className="focus-ring inline-flex items-center gap-2 rounded-md px-1 py-2 text-sm font-bold text-black/60 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 text-blue-700" />
          View Documents
        </Link>

        <div className="mt-4 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">Documents</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-black sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-black/60">{description}</p>
        </div>

        {children}
      </div>
    </section>
  );
}
