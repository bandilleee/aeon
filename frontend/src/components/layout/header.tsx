"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, Bell, Menu, X, Book, ChevronDown, LogOut, Settings, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context"; // <-- Bridge!

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  isAdmin?: boolean;
}

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];
  let currentPath = "";
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    let label = segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    if (segment === "dashboard") label = "Dashboard";
    if (segment === "admin") label = "Admin";

    breadcrumbs.push({ label, href: currentPath });
  });

  return breadcrumbs;
}

export function Header({ onMobileMenuToggle, isMobileMenuOpen, isAdmin }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);
  
  // Real Auth Context!
  const { user, logout } = useAuth();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic user data processing
  const displayName = user?.displayName || user?.firstName || user?.email?.split('@')[0] || "User";
  const email = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  const isUserAdmin = isAdmin || user?.role?.toLowerCase() === "admin";
  const avatarUrl = user?.avatarUrl;

  // Mock notifications
  const notifications = [
    { id: 1, title: "New access request", description: "John Smith requested access", time: "5 min ago", unread: true },
    { id: 2, title: "Event approved", description: "Team Meeting has been approved", time: "1 hour ago", unread: true },
    { id: 3, title: "Task assigned", description: "You've been assigned to Project Setup", time: "2 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login"); // Force redirect to login page
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button onClick={onMobileMenuToggle} className="md:hidden text-zinc-400 hover:text-white transition-colors">
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">aeon</span>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                <span className="text-zinc-700">/</span>
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-zinc-200 font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-zinc-500 hover:text-zinc-300 transition-colors">{crumb.label}</Link>
                )}
              </div>
            ))}
          </nav>
          <span className="md:hidden text-zinc-200 font-medium text-sm">{breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}</span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 md:gap-4">
          
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input type="text" placeholder="Search..." className="w-64 bg-zinc-900/50 border border-white/5 text-xs text-zinc-300 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600" />
            </div>
          </div>

          <button className="hidden md:flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs border border-white/5 bg-zinc-900/50 px-3 py-1.5 rounded-full hover:border-white/20">
            <Book className="h-3 w-3" /><span>Docs</span>
          </button>

          <div className="hidden md:block h-4 w-px bg-zinc-800" />

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }} className="relative text-zinc-500 hover:text-white transition-colors p-2 rounded-md hover:bg-white/5">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden">
                  <div className="p-3 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-zinc-200">Notifications</h3>
                      {unreadCount > 0 && <span className="text-xs text-zinc-500">{unreadCount} unread</span>}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={cn("p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0", notification.unread && "bg-white/[0.02]")}>
                        <div className="flex items-start gap-3">
                          {notification.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                          <div className={cn(!notification.unread && "ml-5")}>
                            <p className="text-sm text-zinc-200">{notification.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{notification.description}</p>
                            <p className="text-xs text-zinc-600 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-white/5">
                    <button className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-2 transition-colors">View all notifications</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white/5 transition-colors">
              
              {/* Dynamic Header Avatar */}
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10">
                  {initials}
                </div>
              )}
              
              <ChevronDown className="h-3 w-3 text-zinc-500 hidden md:block" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden">
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-medium text-zinc-200">{displayName}</p>
                    <p className="text-xs text-zinc-500">{email}</p>
                  </div>

                  <div className="p-1">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors" onClick={() => setShowUserMenu(false)}>
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    {isUserAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors" onClick={() => setShowUserMenu(false)}>
                        <Shield className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="p-1 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}