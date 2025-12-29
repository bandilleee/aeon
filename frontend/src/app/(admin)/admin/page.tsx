"use client";
import {
  Users,
  UserPlus,
  ListChecks,
  FileText,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
  Cog,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback } from "@/components/ui";
import { cn } from "@/lib/utils";

// --- Stats panel as cards [same card/data layout style as dashboard] ---
const stats = [
  {
    title: "Total Users",
    value: 1723,
    change: "+12 this week",
    changeType: "positive",
    icon: Users,
    iconColor: "bg-blue-500/10 text-blue-300"
  },
  {
    title: "Access Requests",
    value: 5,
    change: "+2 today",
    changeType: "neutral",
    icon: UserPlus,
    iconColor: "bg-violet-500/10 text-violet-400"
  },
  {
    title: "Event Approvals",
    value: 3,
    change: "",
    changeType: "neutral",
    icon: ListChecks,
    iconColor: "bg-amber-500/10 text-amber-400"
  },
  {
    title: "Audit Activity",
    value: 242,
    change: "",
    changeType: "neutral",
    icon: FileText,
    iconColor: "bg-zinc-500/10 text-zinc-300"
  },
];

const activities = [
  {
    title: "Access granted",
    description: "Sarah Johnson approved a new user request",
    time: "2 min ago",
    icon: ShieldCheck,
    iconBg: "bg-violet-500/10 text-violet-400",
  },
  {
    title: "Event created",
    description: 'Admin created "Security Roundtable"',
    time: "11 min ago",
    icon: Calendar,
    iconBg: "bg-blue-500/10 text-blue-400",
  },
  {
    title: "Audit triggered",
    description: "Michael Lee escalated an audit log incident",
    time: "30 min ago",
    icon: FileText,
    iconBg: "bg-zinc-500/10 text-zinc-300",
  },
  {
    title: "User deactivated",
    description: "Admin disabled user Michael N.",
    time: "41 min ago",
    icon: Users,
    iconBg: "bg-blue-500/10 text-blue-400",
  },
];

const requests = [
  {
    name: "Jacob Mensah",
    avatar: "JM",
    type: "Join",
    status: "Pending",
    info: "Marketing Team",
    since: "3m"
  },
  {
    name: "Anele Sithole",
    avatar: "AS",
    type: "Join",
    status: "Pending",
    info: "Tech Group",
    since: "11m"
  },
  {
    name: "Linda van Rooyen",
    avatar: "LR",
    type: "Join",
    status: "Pending",
    info: "Events Lead",
    since: "15m"
  },
];

// --- Admin Overview Page ---
export default function AdminOverviewPage() {
  // Optional: use auth/context for personalized name, etc.
  const user = { firstName: "Bandile" };

  // Greeting for admin (optional)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 md:p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {getGreeting()}, {user.firstName}
          </h1>
          <p className="text-sm text-zinc-500">
            Here’s your technical command center for AEON.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/audit-logs">
            <Button variant="secondary" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Audit Log
            </Button>
          </Link>
          <Link href="/admin/access-requests">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Access
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(card => (
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
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Link
                  href="/admin/audit-logs"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {activities.map((a, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer"
                  >
                    <div className={cn("p-2 rounded-lg", a.iconBg)}>
                      <a.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium">{a.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {a.description}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-600 whitespace-nowrap">{a.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Requests */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Pending Access Requests</CardTitle>
                <Link
                  href="/admin/access-requests"
                  className="text-xs text-zinc-500 hover:text-violet-300 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {requests.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-lg hover:border-violet-800/80 transition-colors cursor-pointer"
                >
                  <Avatar className="h-9 w-9 text-base">
                    <AvatarFallback className="bg-violet-700 text-white">{r.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-zinc-100 font-semibold">{r.name}</div>
                    <div className="text-xs text-zinc-500">{r.info} • {r.type}</div>
                  </div>
                  <Badge variant="info" className="ml-auto rounded-full bg-violet-800/60 border-violet-700/80">{r.status}</Badge>
                  <div className="text-xs text-zinc-500 w-12 text-right">{r.since} ago</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions for Admin */}
      <div>
        <h2 className="text-lg font-medium text-zinc-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Approve Access"
            description="Approve user or leader access"
            href="/admin/access-requests"
            icon={UserPlus}
          />
          <QuickAction
            title="Approve Events"
            description="Review and approve scheduled events"
            href="/admin/event-approvals"
            icon={Calendar}
          />
          <QuickAction
            title="User Management"
            description="See all users and roles"
            href="/admin/users"
            icon={Users}
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
        <p>© 2024 Aeon Admin. Engineered by Bandile Ndlovu.</p>
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

// --- QuickAction block reused, matches your dashboard style ---
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