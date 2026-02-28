"use client";
import { AdminProtectedRoute } from "@/components/auth/admin-protected-route";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Terminal,
  Shield,
  Users,
  Calendar,
  ScrollText,
  Cog,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  HelpCircle,
  X,
  Menu,
  Command,
  Clock,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Navigation item type
 */
interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

/**
 * Navigation section type
 */
interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Admin navigation sections
 */
const adminNavSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href:  "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Event Approvals", href: "/admin/event-approvals", icon: Calendar, badge: 5 },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { title: "Settings", href: "/admin/system", icon: Cog },
    ],
  },
];


/**
 * Mock notifications
 */
const mockNotifications = [
  {
    id: "1",
    title: "New event pending approval",
    description: "Team Building Workshop by Linda Van Rooyen",
    time: "5 min ago",
    unread: true,
    type:  "event" as const,
  },
  {
    id:  "2",
    title: "User account locked",
    description: "Emma Davis - too many failed attempts",
    time:  "1 hour ago",
    unread: true,
    type: "security" as const,
  },
  {
    id: "3",
    title: "System backup completed",
    description: "Daily backup finished successfully",
    time: "3 hours ago",
    unread:  false,
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [commandSearch, setCommandSearch] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Get real user from auth context
const { user } = useAuth();

// Compute display values from real user
const adminUser = {
  name: user?.displayName || user?.email?.split('@')[0] || 'Admin',
  email: user?.email || '',
  role: user?.role === 'admin' ? 'Administrator' : 'User',
  initials: user?.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.slice(0, 2).toUpperCase() || 'AD'),
};

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
      if ((e.metaKey || e. ctrlKey) && e.key === "k") {
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

  const handleLogout = () => {
    router.push("/login");
  };

  // Flatten nav items for command palette
  const allNavItems = adminNavSections.flatMap((section) => section.items);
  const filteredCommands = allNavItems.filter((item) =>
    item.title.toLowerCase().includes(commandSearch.toLowerCase())
  );

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-black">
        {/* Command Palette */}
        {showCommandPalette && (
          <>
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              onClick={() => {
                setShowCommandPalette(false);
                setCommandSearch("");
              }}
            />
            <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101] px-4">
              <div className="bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <Search className="h-4 w-4 text-zinc-500" />
                  <input
                    ref={commandInputRef}
                    type="text"
                    placeholder="Search commands..."
                    value={commandSearch}
                    onChange={(e) => setCommandSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder: text-zinc-600 focus:outline-none"
                  />
                  <kbd className="px-1.5 py-0.5 text-[10px] text-zinc-500 bg-zinc-800 rounded">
                    ESC
                  </kbd>
                </div>
                <div className="max-h-64 overflow-y-auto py-2">
                  {filteredCommands.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-zinc-600">No results found</p>
                  ) : (
                    filteredCommands.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            router.push(item.href);
                            setShowCommandPalette(false);
                            setCommandSearch("");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2. 5 text-left hover:bg-white/5 transition-colors"
                        >
                          <Icon className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm text-zinc-300">{item.title}</span>
                          {item.badge && (
                            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-zinc-300 rounded">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 h-screen bg-zinc-950/30 border-r border-white/5 z-50 flex flex-col transition-all duration-300",
            isCollapsed ? "w-[68px]" : "w-64",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "p-4 flex items-center gap-3 mb-2",
              isCollapsed ? "justify-center" : "px-6"
            )}
          >
            <div className="w-8 h-8 bg-white/5 rounded border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50 flex-shrink-0">
              <Shield className="h-4 w-4" strokeWidth={1.5} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-zinc-100 font-semibold tracking-tight text-sm">
                  AEON
                </span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            )}
            {/* Mobile Close */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden ml-auto p-1 text-zinc-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
            {adminNavSections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <div className="px-2 mb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-all group relative",
                          active
                            ? "text-zinc-100 bg-white/5 shadow-sm shadow-black/20 ring-1 ring-white/5"
                            : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5",
                          isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 flex-shrink-0 transition-colors",
                            active ? "text-white" : "group-hover:text-white"
                          )}
                        />
                        {! isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-zinc-300 rounded">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {isCollapsed && item.badge && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-medium bg-white text-black rounded-full flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Help Link */}
          <div className="px-3 py-2">
            <Link
              href="/admin/support"
              className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md transition-colors",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? "Help & Support" : undefined}
            >
              <HelpCircle className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>Help & Support</span>}
            </Link>
          </div>

          {/* Collapse Button */}
          <div className="px-3 py-2 hidden md:block">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md transition-colors",
                isCollapsed && "justify-center"
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* User Section */}
          <div className="p-3 border-t border-white/5">
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-md bg-white/[0.02]",
                isCollapsed && "justify-center"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-[10px] text-white font-bold border border-white/10 flex-shrink-0">
                {adminUser.initials}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-xs text-zinc-200 font-medium truncate w-full">
                    {adminUser.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate w-full">
                    {adminUser.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            "min-h-screen transition-all duration-300",
            isCollapsed ? "md:pl-[68px]" : "md: pl-64"
          )}
        >
          {/* Header */}
          <header className="sticky top-0 z-30 h-14 bg-black/80 backdrop-blur-xl border-b border-white/5">
            <div className="h-full px-4 flex items-center justify-between gap-4">
              {/* Left Side */}
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Search */}
                <button
                  onClick={() => setShowCommandPalette(true)}
                  className="flex items-center gap-2 px-3 py-1. 5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-md transition-colors group"
                >
                  <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400" />
                  <span className="hidden sm:block text-xs text-zinc-500 group-hover:text-zinc-400">
                    Search... 
                  </span>
                  <div className="hidden sm:flex items-center gap-0.5 ml-2">
                    <kbd className="px-1 py-0.5 text-[10px] text-zinc-600 bg-zinc-800 rounded">⌘</kbd>
                    <kbd className="px-1 py-0.5 text-[10px] text-zinc-600 bg-zinc-800 rounded">K</kbd>
                  </div>
                </button>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-1">
                {/* Notifications */}
                <div className="relative" data-dropdown>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className={cn(
                      "relative p-2 rounded-md transition-colors",
                      showNotifications
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover: text-white hover:bg-white/5"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <span className="text-sm font-medium text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-zinc-500 hover:text-white transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-sm text-zinc-600">
                            No notifications
                          </p>
                        ) : (
                          notifications.map((notification) => {
                            const NotifIcon = getNotificationIcon(notification.type);
                            return (
                              <div
                                key={notification.id}
                                className={cn(
                                  "px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors",
                                  notification.unread && "bg-violet-500/5"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <NotifIcon className="h-4 w-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm text-zinc-200 truncate">
                                        {notification.title}
                                      </p>
                                      {notification.unread && (
                                        <span className="w-1. 5 h-1.5 bg-violet-500 rounded-full flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                      {notification.description}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {notification.time}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* User Menu */}
                <div className="relative" data-dropdown>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(! showUserMenu);
                      setShowNotifications(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-1. 5 rounded-md transition-colors",
                      showUserMenu ?  "bg-white/10" : "hover:bg-white/5"
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-[10px] text-white font-bold">
                      {adminUser.initials}
                    </div>
                    <ChevronsUpDown className="h-3. 5 w-3.5 text-zinc-600" />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">{adminUser.name}</p>
                        <p className="text-xs text-zinc-500">{adminUser.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/admin/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:text-white hover: bg-white/5 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/admin/system"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover: text-white hover:bg-white/5 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </div>
                      <div className="py-1 border-t border-white/5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
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
    </AdminProtectedRoute>
  );
}