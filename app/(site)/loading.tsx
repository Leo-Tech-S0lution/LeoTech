export default function SiteLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">Loading</p>
      </div>
    </div>
  );
}
