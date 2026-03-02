"use client";

import { useState, useEffect } from "react";
import { WelcomeLoader } from "@/components/ui/welcome-loader";
import { DashboardLayout } from "./dashboard-layout";

interface DashboardEntryProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export function DashboardEntry({ children, isAdmin = false }: DashboardEntryProps) {
  const [showLoader, setShowLoader] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check if this is a fresh login by looking for the flag
    // login-form sets "aeon_just_logged_in" = "true" right after successful auth
    const justLoggedIn = sessionStorage.getItem("aeon_just_logged_in");

    if (justLoggedIn === "true") {
      // Remove the flag so it doesn't show again on next page navigation
      sessionStorage.removeItem("aeon_just_logged_in");
      setShowLoader(true);
    }

    setReady(true);
  }, []);

  const handleLoaderComplete = () => {
    setShowLoader(false);
  };

  // Don't render anything until we've checked the flag (prevents flash)
  if (!ready) return null;

  if (showLoader) {
    return <WelcomeLoader onComplete={handleLoaderComplete} duration={2500} />;
  }

  return (
    <DashboardLayout isAdmin={isAdmin}>
      {children}
    </DashboardLayout>
  );
}