"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar, CheckSquare, Users, TrendingUp, ArrowRight, Clock, Plus, ChevronRight, Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Services & Auth
import { taskService } from "@/services/tasks.service";
import { eventService } from "@/services/events.service";
import { memberService } from "@/services/members.service";
import { settingsService } from "@/services/settings.service";
import { useAuth } from "@/contexts/auth-context"; 

import { Task } from "@/types/task.types";
import { Event } from "@/types/event.types";
import { Member } from "@/types/member.types";

/**
 * Time Formatter for Activity Feed
 */
function formatTimeAgo(dateString: string) {
  if (!dateString) return "Just now";
  const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(safeDateString);
  const diffMs = Date.now() - date.getTime();
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function StatsCard({ title, value, change, changeType, icon: Icon, iconColor }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-zinc-100">{value}</p>
            <p className={`text-xs mt-1 ${changeType === "positive" ? "text-emerald-500" : changeType === "negative" ? "text-red-400" : "text-zinc-500"}`}>
              {change}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${iconColor}`}><Icon className="h-5 w-5" /></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, description, time, icon: Icon, iconBg }: any) {
  return (
    <div className="flex items-start gap-4 p-3 hover:bg-white/[0.02] rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${iconBg}`}><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 font-medium">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">{description}</p>
      </div>
      <span className="text-xs text-zinc-600 whitespace-nowrap">{time}</span>
    </div>
  );
}

function UpcomingEvent({ id, title, date, time, isVirtual }: any) {
  const dateObj = new Date(date.endsWith('Z') ? date : `${date}Z`);
  const month = dateObj.toLocaleDateString("en-US", { month: "short" });
  const day = dateObj.getDate();

  return (
    <Link href={`/dashboard/events/${id}`} className="flex items-center gap-4 p-3 bg-zinc-900/30 border border-white/5 rounded-lg hover:border-white/10 hover:bg-zinc-900/50 transition-all group">
      <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-lg flex flex-col items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
        <span className="text-[10px] text-zinc-500 uppercase font-medium">{month}</span>
        <span className="text-lg font-bold text-zinc-200 leading-none mt-0.5">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 font-medium truncate group-hover:text-white transition-colors">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
          <Clock className="h-3 w-3" /> {time}
        </p>
      </div>
      {isVirtual && <div className="hidden sm:flex items-center px-2 py-1 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400">Virtual</div>}
      <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function QuickAction({ title, description, href, icon: Icon }: any) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-white/5 rounded-lg hover:border-white/10 hover:bg-zinc-900/50 transition-all group">
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

export function DashboardOverview() {
  const { user } = useAuth(); 
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Leader");
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    // SAFETY CHECK: Wait for the user context to be fully loaded before fetching
    if (!user || !user.id) return;

    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [tasksRes, eventsRes, membersRes, settingsRes] = await Promise.all([
          taskService.getAllTasks(),
          eventService.getAllEvents(),
          memberService.getAllMembers(),
          settingsService.getSettings(user.id) // Safely uses the real user ID
        ]);

        if (tasksRes.success) setTasks(tasksRes.data || []);
        if (eventsRes.success) setEvents(eventsRes.data || []);
        if (membersRes.success) setMembers(membersRes.data || []);
        
        // Dynamic name from settings, falling back to Auth context name
        if (settingsRes.success && settingsRes.data?.displayName) {
          setUserName(settingsRes.data.displayName.split(" ")[0]);
        } else if (user?.name) {
          setUserName(user.name.split(" ")[0]);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [user]); 

  // --- STATS CALCULATIONS ---
  const activeTasks = tasks.filter(t => t.status !== "completed").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((tasks.filter(t => t.status === "completed").length / totalTasks) * 100);
  const totalMembers = members.length;
  const totalEvents = events.length;

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => {
        const safeStart = e.startDate.endsWith('Z') ? e.startDate : `${e.startDate}Z`;
        return new Date(safeStart) >= now;
      })
      .sort((a, b) => new Date(a.startDate.endsWith('Z') ? a.startDate : `${a.startDate}Z`).getTime() - new Date(b.startDate.endsWith('Z') ? b.startDate : `${b.startDate}Z`).getTime())
      .slice(0, 3);
  }, [events]);

  const activityFeed = useMemo(() => {
    const activities: any[] = [];
    events.forEach(e => activities.push({
      id: `ev_${e.id}`, type: 'event', title: "New event created", description: `Scheduled "${e.title}"`,
      dateObj: new Date(e.createdAt?.endsWith('Z') ? e.createdAt : `${e.createdAt}Z`),
      icon: Calendar, iconBg: "bg-blue-500/10 text-blue-400"
    }));
    tasks.forEach(t => {
      const isDone = t.status === "completed";
      activities.push({
        id: `tk_${t.id}`, type: 'task', title: isDone ? "Task completed" : "New task assigned",
        description: isDone ? `Finished "${t.title}"` : `Added "${t.title}"`,
        dateObj: new Date(t.createdAt?.endsWith('Z') ? t.createdAt : `${t.createdAt}Z`),
        icon: CheckSquare, iconBg: isDone ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
      });
    });
    members.forEach(m => activities.push({
      id: `mb_${m.id}`, type: 'member', title: "New member joined", description: `${m.displayName} joined the community`,
      dateObj: new Date(m.joinedAt?.endsWith('Z') ? m.joinedAt : `${m.joinedAt}Z`),
      icon: Users, iconBg: "bg-purple-500/10 text-purple-400"
    }));
    return activities.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 5);
  }, [events, tasks, members]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-zinc-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
        <p className="font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm text-zinc-500">
            Here's what's happening with your community today. 
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/events/create">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Events" value={totalEvents} change="Tracking all events" changeType="neutral" icon={Calendar} iconColor="bg-blue-500/10 text-blue-400" />
        <StatsCard title="Active Tasks" value={activeTasks} change={`${tasks.length - activeTasks} completed`} changeType={activeTasks > 0 ? "neutral" : "positive"} icon={CheckSquare} iconColor="bg-amber-500/10 text-amber-400" />
        <StatsCard title="Total Members" value={totalMembers} change="Community size" changeType="positive" icon={Users} iconColor="bg-purple-500/10 text-purple-400" />
        <StatsCard title="Task Completion" value={`${completionRate}%`} change="Productivity rate" changeType={completionRate > 50 ? "positive" : "neutral"} icon={TrendingUp} iconColor="bg-emerald-500/10 text-emerald-400" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Synthetic Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <span className="text-xs text-zinc-500 px-2 py-1 bg-white/5 rounded-md">Live Sync</span>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              {activityFeed.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">No activity recorded yet. Create some tasks or events!</div>
              ) : (
                <div className="space-y-1">
                  {activityFeed.map((item) => (
                    <ActivityItem
                      key={item.id}
                      title={item.title}
                      description={item.description}
                      time={formatTimeAgo(item.dateObj.toISOString())}
                      icon={item.icon}
                      iconBg={item.iconBg}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Events</CardTitle>
                <Link href="/dashboard/events" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm border border-dashed border-white/10 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  No upcoming events scheduled.
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const safeStart = event.startDate.endsWith('Z') ? event.startDate : `${event.startDate}Z`;
                  const timeString = new Date(safeStart).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                  return (
                    <UpcomingEvent
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      date={event.startDate}
                      time={timeString}
                      isVirtual={event.isVirtual}
                    />
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-zinc-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction title="Create Event" description="Schedule a new event" href="/dashboard/events/create" icon={Calendar} />
          <QuickAction title="Add Task" description="Create a new task" href="/dashboard/tasks/create" icon={CheckSquare} />
          <QuickAction title="View Members" description="Browse community members" href="/dashboard/members" icon={Users} />
          <QuickAction title="Settings" description="Manage your preferences" href="/dashboard/settings" icon={TrendingUp} />
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} Aeon. Developed & Engineered by Bandile Ndlovu.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">Help</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}