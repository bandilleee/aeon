"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
      <p className="text-zinc-500 text-sm mb-8 max-w-sm">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-300 transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}