"use client";

import { useState, useEffect } from "react";
import { WelcomeLoader } from "@/components/ui/welcome-loader";
import { DashboardLayout } from "./dashboard-layout";

interface DashboardEntryProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export function DashboardEntry({ children, isAdmin = false }: DashboardEntryProps) {
  const [showLoader, setShowLoader] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // Check if user has seen the loader before in this session
    const hasSeenLoader = sessionStorage.getItem("aeon_loader_shown");

    if (hasSeenLoader) {
      setShowLoader(false);
      setIsFirstVisit(false);
    }
  }, []);

  const handleLoaderComplete = () => {
    sessionStorage.setItem("aeon_loader_shown", "true");
    setShowLoader(false);
  };

  if (showLoader && isFirstVisit) {
    return <WelcomeLoader onComplete={handleLoaderComplete} duration={6000} />;
  }

  return (
    <DashboardLayout isAdmin={isAdmin}>
      {children}
    </DashboardLayout>
  );
}