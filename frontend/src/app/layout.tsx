import type { Metadata } from "next";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: "Aeon",
  description: "Aeon - Enterprise Platform for team collaboration",
};

/**
 * Root Layout
 * This is the main layout that wraps the entire application.
 * It must include <html> and <body> tags.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050505] text-zinc-400 antialiased">
        {children}
      </body>
    </html>
  );
}