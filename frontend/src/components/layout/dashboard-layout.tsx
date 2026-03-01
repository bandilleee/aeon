"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans antialiased">
      <div className="flex">
        {/* Sidebar (Desktop) - Uses auth context internally for user role */}
        <Sidebar />

        {/* Mobile Navigation */}
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isAdmin={isAdmin}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Header */}
          <Header
            onMobileMenuToggle={() => setIsMobileMenuOpen(! isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
            isAdmin={isAdmin}
          />

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}