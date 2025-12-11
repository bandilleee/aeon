"use client";

import {
  Calendar,
  CheckSquare,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  Plus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Stats Card Component
 */
function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  iconColor:  string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-zinc-100">{value}</p>
            <p
              className={`text-xs mt-1 ${
                changeType === "positive"
                  ? "text-emerald-500"
                  : changeType === "negative"
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}
            >
              {change}
            </p>
          </div>
          <div
            className={`p-3 rounded-lg ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Activity Item Component
 */
function ActivityItem({
  title,
  description,
  time,
  icon: Icon,
  iconBg,
}: {
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  iconBg: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 font-medium">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <span className="text-xs text-zinc-600 whitespace-nowrap">{time}</span>
    </div>
  );
}

/**
 * Upcoming Event Component
 */
function UpcomingEvent({
  title,
  date,
  time,
  attendees,
}:  {
  title: string;
  date: string;
  time: string;
  attendees:  number;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-lg hover:border-white/10 transition-colors cursor-pointer">
      <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-lg flex flex-col items-center justify-center border border-white/10">
        <span className="text-xs text-zinc-500">{date. split(" ")[0]}</span>
        <span className="text-lg font-semibold text-zinc-200">{date.split(" ")[1]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 font-medium truncate">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{time}</p>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3 text-zinc-600" />
        <span className="text-xs text-zinc-500">{attendees}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-zinc-600" />
    </div>
  );
}

/**
 * Quick Action Component
 */
function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon:  React.ElementType;
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

/**
 * Main Dashboard Overview Component
 */
export function DashboardOverview() {
  // Mock user data
  const user = {
    firstName: "Jane",
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            {getGreeting()}, {user.firstName}
          </h1>
          <p className="text-sm text-zinc-500">
            Here's what's happening with your community today. 
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Activity Log
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Create
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={24}
          change="+3 this month"
          changeType="positive"
          icon={Calendar}
          iconColor="bg-blue-500/10 text-blue-400"
        />
        <StatsCard
          title="Active Tasks"
          value={12}
          change="4 due this week"
          changeType="neutral"
          icon={CheckSquare}
          iconColor="bg-amber-500/10 text-amber-400"
        />
        <StatsCard
          title="Members"
          value={156}
          change="+12 new members"
          changeType="positive"
          icon={Users}
          iconColor="bg-emerald-500/10 text-emerald-400"
        />
        <StatsCard
          title="Engagement"
          value="89%"
          change="+5% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-purple-500/10 text-purple-400"
        />
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
                  href="/dashboard/activity"
                  className="text-xs text-zinc-500 hover: text-zinc-300 transition-colors"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                <ActivityItem
                  title="New event created"
                  description='John created "Team Building Workshop"'
                  time="5 min ago"
                  icon={Calendar}
                  iconBg="bg-blue-500/10 text-blue-400"
                />
                <ActivityItem
                  title="Task completed"
                  description='Sarah marked "Update documentation" as complete'
                  time="1 hour ago"
                  icon={CheckSquare}
                  iconBg="bg-emerald-500/10 text-emerald-400"
                />
                <ActivityItem
                  title="New member joined"
                  description="Michael Thompson joined the community"
                  time="2 hours ago"
                  icon={Users}
                  iconBg="bg-purple-500/10 text-purple-400"
                />
                <ActivityItem
                  title="Event approved"
                  description='"Monthly Meetup" has been approved by admin'
                  time="3 hours ago"
                  icon={Calendar}
                  iconBg="bg-amber-500/10 text-amber-400"
                />
                <ActivityItem
                  title="Task assigned"
                  description="You've been assigned to Project Setup"
                  time="5 hours ago"
                  icon={CheckSquare}
                  iconBg="bg-blue-500/10 text-blue-400"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Events</CardTitle>
                <Link
                  href="/dashboard/events"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <UpcomingEvent
                title="Team Building Workshop"
                date="Dec 15"
                time="2:00 PM - 5:00 PM"
                attendees={24}
              />
              <UpcomingEvent
                title="Monthly Meetup"
                date="Dec 20"
                time="6:00 PM - 8:00 PM"
                attendees={45}
              />
              <UpcomingEvent
                title="Year-End Celebration"
                date="Dec 28"
                time="7:00 PM - 11:00 PM"
                attendees={89}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-zinc-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Create Event"
            description="Schedule a new event"
            href="/dashboard/events/create"
            icon={Calendar}
          />
          <QuickAction
            title="Add Task"
            description="Create a new task"
            href="/dashboard/tasks/create"
            icon={CheckSquare}
          />
          <QuickAction
            title="View Members"
            description="Browse community members"
            href="/dashboard/members"
            icon={Users}
          />
          <QuickAction
            title="Settings"
            description="Manage your preferences"
            href="/dashboard/settings"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
        <p>© 2024 Aeon.  Developed & Engineered by Bandile Ndlovu.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">
            Help
          </a>
          <a href="#" className="hover: text-zinc-400 transition-colors">
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