"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ListChecks,
  FileText,
  Calendar,
  ShieldCheck,
  Plus,
  ArrowRight,
  Cog,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { adminDashboardService, DashboardStats } from "@/services/admin-dashboard.service";

// --- Admin Overview Page ---
export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real stats from backend
  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const response = await adminDashboardService.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  // Get user's first name for greeting
  const firstName = user?.displayName?.split(' ')[0] || user?.firstName || 'Admin';

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Build stats cards from real data
  const statsCards = stats ? [
    {
      title: "Total Users",
      value: stats.users.total,
      change: `${stats.users.active} active`,
      changeType: "positive" as const,
      icon: Users,
      iconColor: "bg-blue-500/10 text-blue-300"
    },
    {
      title: "Pending Users",
      value: stats.users.pending,
      change: stats.users.pending > 0 ? "Needs attention" : "All clear",
      changeType: stats.users.pending > 0 ? "neutral" as const : "positive" as const,
      icon: UserPlus,
      iconColor: "bg-violet-500/10 text-violet-400"
    },
    {
      title: "Event Approvals",
      value: stats.events.pending,
      change: `${stats.events.total} total events`,
      changeType: "neutral" as const,
      icon: ListChecks,
      iconColor: "bg-amber-500/10 text-amber-400"
    },
    {
      title: "Tasks",
      value: stats.tasks.total,
      change: `${stats.tasks.completed} completed`,
      changeType: "neutral" as const,
      icon: FileText,
      iconColor: "bg-zinc-500/10 text-zinc-300"
    },
  ] : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-violet-500" />
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-zinc-500">
            Here's your technical command center for AEON.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/audit-logs">
            <Button variant="secondary" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Audit Log
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(card => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-semibold text-zinc-100">{card.value}</p>
                  {card.change && (
                    <p className={cn(
                      "text-xs mt-1",
                      card.changeType === "positive"
                        ? "text-emerald-500"
                        : card.changeType === "negative"
                        ? "text-red-400"
                        : "text-zinc-500"
                    )}>{card.change}</p>
                  )}
                </div>
                <div className={cn("p-3 rounded-lg", card.iconColor)}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Users</CardTitle>
                <Link
                  href="/admin/users"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {stats?.recent.users && stats.recent.users.length > 0 ? (
                  stats.recent.users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-start gap-4 p-4 hover:bg-white/[0.02] rounded-lg transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-medium">{u.displayName}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {u.email} • {u.role}
                        </p>
                      </div>
                      <Badge 
                        variant={u.status === "active" ? "success" : "warning"}
                        className="text-xs"
                      >
                        {u.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 p-4">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Event Approvals */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Pending Approvals</CardTitle>
                <Link
                  href="/admin/event-approvals"
                  className="text-xs text-zinc-500 hover:text-violet-300 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {stats?.pendingApprovals && stats.pendingApprovals.length > 0 ? (
                stats.pendingApprovals.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-lg hover:border-violet-800/80 transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Calendar className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-zinc-100 font-semibold truncate">{event.title}</div>
                      <div className="text-xs text-zinc-500">{event.category}</div>
                    </div>
                    <Badge variant="warning" className="rounded-full">Pending</Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-sm text-zinc-400">All caught up!</p>
                  <p className="text-xs text-zinc-600">No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions for Admin */}
      <div>
        <h2 className="text-lg font-medium text-zinc-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Manage Users"
            description={`${stats?.users.total || 0} total users`}
            href="/admin/users"
            icon={Users}
          />
          <QuickAction
            title="Event Approvals"
            description={`${stats?.events.pending || 0} pending`}
            href="/admin/event-approvals"
            icon={Calendar}
          />
          <QuickAction
            title="Audit Logs"
            description="View system activity"
            href="/admin/audit-logs"
            icon={FileText}
          />
          <QuickAction
            title="System Settings"
            description="Manage platform settings"
            href="/admin/system"
            icon={Cog}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} Aeon Admin. Engineered by Bandile Ndlovu.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">
            Help
          </a>
          <a href="#" className="hover:text-zinc-400 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-zinc-400 transition-colors">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}

// --- QuickAction block ---
function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-white/5 rounded-lg hover:border-white/10 hover:bg-zinc-900/50 transition-all group"
    >
      <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
        <Icon className="h-5 w-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-zinc-200 font-medium">{title}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}