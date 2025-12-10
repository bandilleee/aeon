import { Metadata } from "next";

/**
 * Metadata for auth pages
 * This sets the page title and description for SEO
 */
export const metadata: Metadata = {
  title: "Authentication - Aeon",
  description: "Sign in or request access to Aeon",
};

/**
 * Auth Layout
 * -----------
 * This layout wraps all pages in the (auth) folder.
 * 
 * The (auth) folder name with parentheses is a "route group" in Next.js. 
 * It doesn't affect the URL - /login is still /login, not /auth/login. 
 * But it lets us share this layout between login and request-access pages.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/5">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>© 2024 Aeon. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-400 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-zinc-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}