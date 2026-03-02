import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
      <p className="text-8xl font-bold text-white/5 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-white mb-2">Page not found</h1>
      <p className="text-zinc-500 text-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-300 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}