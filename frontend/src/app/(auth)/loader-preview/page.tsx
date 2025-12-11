"use client";

import { useState } from "react";
import { WelcomeLoader } from "@/components/ui/welcome-loader";
import { Button } from "@/components/ui";
import { Terminal, RotateCcw } from "lucide-react";

export default function LoaderPreviewPage() {
  const [showLoader, setShowLoader] = useState(true);

  if (showLoader) {
    return <WelcomeLoader onComplete={() => setShowLoader(false)} duration={2500} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6">
          <Terminal className="h-8 w-8 text-white" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-2xl font-semibold text-white mb-2">
          Welcome to Aeon
        </h1>
        <p className="text-zinc-500 mb-8">
          The loader has completed. This is where the dashboard would appear.
        </p>

        <Button
          onClick={() => setShowLoader(true)}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Replay Loader
        </Button>
      </div>
    </div>
  );
}