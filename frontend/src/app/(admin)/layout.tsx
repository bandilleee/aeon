"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Calendar,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Command,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  description?: string;
}

const navigationItems: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutGrid,
    description: "Dashboard & analytics",
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Manage platform users",
  },
  {
    label: "Event Approvals",
    href: "/admin/event-approvals",
    icon: Calendar,
    badge: 5,
    description: "Review pending events",
  },
  {
    label: "Audit Logs",
    href:  "/admin/audit-logs",
    icon: FileText,
    description: "System activity history",
  },
  {
    label: "System Settings",
    href: "/admin/system",
    icon: Settings,
    description: "Platform configuration",
  },
];

// Mock data
const currentAdmin = {
  id: "admin_001",
  name: "Sarah Mitchell",
  email: "sarah. admin@aeon.com",
  role: "Administrator",
  initials: "SM",
};

const mockNotifications = [
  {
    id: "1",
    title: "New event pending approval",
    description: "Team Building Workshop submitted by Linda Van Rooyen",
    time: "5 min ago",
    unread: true,
    type: "event" as const,
  },
  {
    id: "2",
    title: "User account locked",
    description: "Emma Davis - too many failed login attempts",
    time: "1 hour ago",
    unread: true,
    type: "security" as const,
  },
  {
    id: "3",
    title: "System backup completed",
    description: "Daily backup finished successfully",
    time: "3 hours ago",
    unread: false,
    type: "system" as const,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "event":
      return Calendar;
    case "security": 
      return AlertCircle;
    case "system":
      return CheckCircle2;
    default:
      return Bell;
  }
};

const getNotificationColor = (type:  string) => {
  switch (type) {
    case "event":
      return "text-violet-400 bg-violet-500/10";
    case "security": 
      return "text-red-400 bg-red-500/10";
    case "system":
      return "text-emerald-400 bg-emerald-500/10";
    default:
      return "text-zinc-400 bg-zinc-500/10";
  }
};

export default function AdminLayout({ children }: { children: React. ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [commandSearch, setCommandSearch] = useState("");
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (! target.closest("[data-dropdown]")) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
        setTimeout(() => commandInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false);
        setShowUserMenu(false);
        setShowNotifications(false);
        setCommandSearch("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ... n, unread: false } :  n))
    );
  };

  const handleLogout = () => {
    router.push("/login");
  };

  const filteredCommands = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(commandSearch. toLowerCase())
  );

  const currentPage = navigationItems.find((item) => isActive(item.href));

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Command Palette */}
      {showCommandPalette && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            onClick={() => {
              setShowCommandPalette(false);
              setCommandSearch("");
            }}
          />
          <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4">
            <div className="bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl">
              {/* Search Input */}
              <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <Command className="h-4 w-4 text-violet-400" />
                </div>
                <input
                  ref={commandInputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white text-base placeholder: text-zinc-500 focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-zinc-500 bg-zinc-800/80 rounded-md border border-white/5">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="px-3 py-2">
                  <p className="px-2 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Navigation
                  </p>
                  {filteredCommands.length === 0 ? (
                    <div className="px-2 py-8 text-center">
                      <p className="text-zinc-500 text-sm">No results found</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredCommands.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.href}
                            onClick={() => {
                              router.push(item.href);
                              setShowCommandPalette(false);
                              setCommandSearch("");
                            }}
                            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 transition-all group"
                          >
                            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-violet-500/10 transition-colors">
                              <Icon className="h-4 w-4 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                {item.label}
                              </p>
                              {item. description && (
                                <p className="text-xs text-zinc-500">{item.description}</p>
                              )}
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">↵</kbd>
                    to select
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">↑↓</kbd>
                    to navigate
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <Sparkles className="h-3 w-3" />
                  Quick Actions
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-zinc-950 border-r border-white/5 z-50 transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Aeon</h1>
              <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wider">Admin</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  active
                    ? "bg-violet-500/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    active ?  "bg-violet-500/20" : "bg-white/5"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-violet-400" : "text-zinc-500")} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-violet-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
              {currentAdmin.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentAdmin.name}</p>
              <p className="text-xs text-zinc-500 truncate">{currentAdmin.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[260px] bg-zinc-950/50 backdrop-blur-xl border-r border-white/5 z-30 flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Aeon</h1>
              <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-widest">
                Admin Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1. 5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isHovered = hoveredNav === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.href)}
                onMouseLeave={() => setHoveredNav(null)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2. 5 rounded-xl transition-all duration-200",
                  active
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {/* Hover Background */}
                {! active && isHovered && (
                  <div className="absolute inset-0 bg-white/5 rounded-xl" />
                )}

                {/* Active Indicator */}
                {active && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full" />
                )}

                <div
                  className={cn(
                    "relative p-2 rounded-lg transition-colors",
                    active ? "bg-black/10" : "bg-white/5"
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-black" : "")} />
                </div>

                <div className="relative flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "relative px-2 py-0.5 text-xs font-semibold rounded-full transition-colors",
                      active
                        ? "bg-violet-500 text-white"
                        : "bg-violet-500/10 text-violet-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Help Link */}
          <Link
            href="/admin/support"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <div className="p-2 bg-white/5 rounded-lg">
              <HelpCircle className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Help & Support</span>
          </Link>

          {/* User Card */}
          <div className="p-3 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/20">
                {currentAdmin. initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentAdmin.name}</p>
                <p className="text-xs text-zinc-500 truncate">{currentAdmin. role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-20 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
          <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumb / Current Page */}
              <div className="hidden sm:flex items-center gap-2">
                {currentPage && (
                  <>
                    <div className="p-1. 5 bg-white/5 rounded-lg">
                      <currentPage.icon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <span className="text-sm font-medium text-white">{currentPage.label}</span>
                    {currentPage.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full">
                        {currentPage.badge} pending
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all group"
              >
                <Search className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
                <span className="hidden md:block text-sm text-zinc-500 group-hover:text-zinc-300">
                  Search... 
                </span>
                <div className="hidden md:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] text-zinc-600 bg-zinc-800/80 rounded border border-white/5">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 text-[10px] text-zinc-600 bg-zinc-800/80 rounded border border-white/5">
                    K
                  </kbd>
                </div>
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/10" />

              {/* Notifications */}
              <div className="relative" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className={cn(
                    "relative p-2.5 rounded-xl transition-all",
                    showNotifications
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1. 5 right-1.5 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-[#09090b]" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-[380px] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Bell className="h-6 w-6 text-zinc-600" />
                          </div>
                          <p className="text-sm text-zinc-500">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {notifications.map((notification) => {
                            const NotifIcon = getNotificationIcon(notification.type);
                            const colorClass = getNotificationColor(notification.type);
                            return (
                              <button
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={cn(
                                  "w-full flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left",
                                  notification.unread && "bg-violet-500/5"
                                )}
                              >
                                <div className={cn("p-2 rounded-xl shrink-0", colorClass)}>
                                  <NotifIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-white">
                                      {notification.title}
                                    </p>
                                    {notification.unread && (
                                      <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 mt-1.5" />
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                    {notification.description}
                                  </p>
                                  <div className="flex items-center gap-1. 5 mt-2">
                                    <Clock className="h-3 w-3 text-zinc-600" />
                                    <span className="text-xs text-zinc-600">{notification.time}</span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02]">
                      <Link
                        href="/admin/notifications"
                        className="flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        View all notifications
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" data-dropdown>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(! showUserMenu);
                    setShowNotifications(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-1.5 rounded-xl transition-all",
                    showUserMenu ?  "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-500/20">
                    {currentAdmin. initials}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white">{currentAdmin.name}</p>
                    <p className="text-xs text-zinc-500">{currentAdmin.role}</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "hidden lg:block h-4 w-4 text-zinc-500 transition-transform",
                      showUserMenu && "rotate-180"
                    )}
                  />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-white/5 bg-gradient-to-br from-violet-500/10 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-base font-bold text-white">
                          {currentAdmin.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {currentAdmin.name}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">{currentAdmin.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-medium bg-violet-500/10 text-violet-400 rounded-full">
                            <Shield className="h-3 w-3" />
                            {currentAdmin.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/admin/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover: bg-white/5 transition-colors"
                      >
                        <User className="h-4 w-4 text-zinc-500" />
                        My Profile
                      </Link>
                      <Link
                        href="/admin/system"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-zinc-500" />
                        Settings
                      </Link>
                      <Link
                        href="/admin/support"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover: bg-white/5 transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                        Help & Support
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="py-2 border-t border-white/5">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}