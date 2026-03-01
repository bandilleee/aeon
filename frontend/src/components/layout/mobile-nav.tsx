"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Settings,
  Shield,
  UserCheck,
  FileCheck,
  ScrollText,
  Cog,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const userNavSections: NavSection[] = [
  {
    title: "Platform",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Events", href: "/dashboard/events", icon: Calendar },
      { title: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { title: "Members", href: "/dashboard/members", icon: Users },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

const adminNavSections: NavSection[] = [
  {
    title: "Admin",
    items: [
      { title: "Admin Overview", href: "/admin", icon: Shield },
      { title: "Access Requests", href: "/admin/access-requests", icon: UserCheck },
      { title: "Event Approvals", href: "/admin/event-approvals", icon: FileCheck },
      { title: "User Management", href: "/admin/users", icon: Users },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { title: "System Settings", href: "/admin/system", icon: Cog },
    ],
  },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function MobileNav({ isOpen, onClose, isAdmin = false }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navSections = isAdmin
    ? [...userNavSections, ...adminNavSections]
    : userNavSections;

  // Build display values from real auth user
  const displayName = user?.displayName || 
    (user?.firstName ? `${user.firstName} ${user.lastName}` : null) || 
    user?.email?.split("@")[0] || 
    "User";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const roleLabel = user?.role === "admin" ? "Administrator" : "Member";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-white/5 md:hidden flex flex-col animate-slide-in-left">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/5 rounded border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
              <Terminal className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="text-zinc-100 font-semibold tracking-tight text-sm">
              AEON
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-2 mb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      item.href !== "/admin" &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all",
                        isActive
                          ? "text-zinc-100 bg-white/5 shadow-sm shadow-black/20 ring-1 ring-white/5"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isActive ? "text-white" : ""
                        )}
                      />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-zinc-300 rounded">
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

        {/* User Section — now uses real auth data */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-xs text-white font-bold border border-white/10 flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-zinc-200 font-medium truncate">
                {displayName}
              </span>
              <span className="text-xs text-zinc-500">{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}