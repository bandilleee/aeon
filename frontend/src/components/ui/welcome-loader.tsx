"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

interface WelcomeLoaderProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds
}

export function WelcomeLoader({ 
  onComplete, 
  duration = 2500 
}: WelcomeLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [showCredit, setShowCredit] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Show credit after a short delay
    const creditTimeout = setTimeout(() => {
      setShowCredit(true);
    }, 400);

    // Complete after duration
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(creditTimeout);
      clearTimeout(completeTimeout);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center"
      >
        {/* Background subtle gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 w-20 h-20 bg-white/10 rounded-2xl blur-xl" />
              
              {/* Logo container */}
              <div className="relative w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-black/50">
                <Terminal className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>

              {/* Animated ring */}
              <motion.div
                className="absolute -inset-2 rounded-2xl border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold text-white tracking-tight mb-2"
          >
            AEON
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-zinc-500 text-sm mb-8"
          >
            Enterprise Platform
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative"
          >
            <div className="w-[200px] h-[2px] bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-zinc-500 to-white rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>

          {/* Credit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showCredit ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-zinc-600 text-xs">
              Developed & Engineered by
            </p>
            <p className="text-zinc-400 text-sm font-medium mt-1">
              Bandile Ndlovu
            </p>
          </motion.div>
        </div>

        {/* Version */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 text-zinc-700 text-xs"
        >
          v1.0.0
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}