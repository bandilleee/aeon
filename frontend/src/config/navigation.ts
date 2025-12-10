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
  type LucideIcon,
} from "lucide-react";

/**
 * Navigation item structure
 */
export interface NavItem {
  title: string;
  href: string;
  icon:  LucideIcon;
  badge?: string | number;
  children?: NavItem[];
}

/**
 * User dashboard navigation
 */
export const userNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Events",
    href:  "/events",
    icon: Calendar,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Members",
    href:  "/members",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

/**
 * Admin dashboard navigation
 * Includes all user navigation plus admin-specific items
 */
export const adminNavigation: NavItem[] = [
  {
    title: "Admin Overview",
    href:  "/admin",
    icon: Shield,
  },
  {
    title: "Access Requests",
    href: "/admin/access-requests",
    icon: UserCheck,
  },
  {
    title: "Event Approvals",
    href: "/admin/event-approvals",
    icon: FileCheck,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon:  Users,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ScrollText,
  },
  {
    title:  "System Settings",
    href: "/admin/system",
    icon:  Cog,
  },
];

/**
 * Settings sub-navigation
 */
export const settingsNavigation: NavItem[] = [
  {
    title:  "Profile",
    href: "/settings/profile",
    icon: Users,
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Shield,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Calendar,
  },
];