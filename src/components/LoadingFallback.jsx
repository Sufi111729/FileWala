export default function LoadingFallback({ label = 'Loading tool...' }) {
  return (
    <section className="bg-white py-16" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 text-sm font-bold text-black/60 sm:px-6 lg:px-8">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/15 border-t-brand-red" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </section>
  );
}
