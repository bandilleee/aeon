"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // Gatekeeper
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#050505] text-zinc-200">
        
        {/* We removed the fake isAdmin={true} prop here. 
            Now it relies entirely on the real user.role from useAuth! */}
        <Sidebar />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <Header
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

      </div>
    </ProtectedRoute>
  );
}