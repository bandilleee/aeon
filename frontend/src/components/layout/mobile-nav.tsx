"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  badgeCounts?: {
    accessRequests?: number;
    eventApprovals?: number;
  };
}

export function MobileNav({
  isOpen,
  onClose,
  isAdmin = false,
  badgeCounts = {},
}: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

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
        {
          title: "Access Requests",
          href: "/admin/access-requests",
          icon: UserCheck,
          badge: badgeCounts.accessRequests,
        },
        {
          title: "Event Approvals",
          href: "/admin/event-approvals",
          icon: FileCheck,
          badge: badgeCounts.eventApprovals,
        },
        { title: "User Management", href: "/admin/users", icon: Users },
        { title: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
        { title: "System Settings", href: "/admin/system", icon: Cog },
      ],
    },
  ];

  const navSections = isAdmin
    ? [...userNavSections, ...adminNavSections]
    : userNavSections;

  // Build display values from real auth user
  const displayName =
    user?.displayName ||
    (user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email) ||
    "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = user?.role === "admin" ? "Administrator" : "Member";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-zinc-950 border-r border-white/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard" || item.href === "/admin"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                        isActive
                          ? "bg-white text-black font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-violet-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{displayName}</p>
              <p className="text-xs text-zinc-500">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}