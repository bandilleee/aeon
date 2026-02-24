"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Calendar,
  Users,
  ChevronRight,
  Clock,
  X,
  AlertCircle,
  Loader2 // <-- Added this for a loading spinner!
} from "lucide-react";
import { Button, Badge, Card, CardContent, Select } from "@/components/ui";
import { getTaskStatusBadge, getTaskPriorityBadge } from "@/lib/mock-data"; // Kept just the badge helpers
import { Task } from "@/types/task.types";
import { cn } from "@/lib/utils";
import { taskService } from "@/services/tasks.service";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function formatDueDate(dateString?: string): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  if (!dateString) return { text: "No due date", isOverdue: false, isDueSoon: false };

  const dueDate = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (diffDays < 0) {
    return { text: `Overdue (${formatted})`, isOverdue: true, isDueSoon: false };
  } else if (diffDays === 0) {
    return { text: "Due today", isOverdue: false, isDueSoon: true };
  } else if (diffDays === 1) {
    return { text: "Due tomorrow", isOverdue: false, isDueSoon: true };
  } else if (diffDays <= 3) {
    return { text: `Due in ${diffDays} days`, isOverdue: false, isDueSoon: true };
  } else {
    return { text: formatted, isOverdue: false, isDueSoon: false };
  }
}

function TaskCard({ task }: { task: Task }) {
  const statusBadge = getTaskStatusBadge(task.status);
  const priorityBadge = getTaskPriorityBadge(task.priority);
  const dueInfo = formatDueDate(task.dueDate);

  // Safety fallbacks because our C# backend doesn't send these yet!
  const collabs = task.collaborators || [];
  const commentCount = task.commentsCount || 0;

  return (
    <Link href={`/dashboard/tasks/${task.id}`}>
      <Card variant="hover" className="group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={cn(
                "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0",
                task.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : task.status === "in_progress" ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : task.status === "in_review" ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-white/5 border-white/10 text-zinc-500"
              )}
            >
              <CheckSquare className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
              </div>

              <h3 className="text-base font-medium text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                {task.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500">
                <div className={cn("flex items-center gap-1", dueInfo.isOverdue && "text-red-400", dueInfo.isDueSoon && !dueInfo.isOverdue && "text-amber-400")}>
                  {dueInfo.isOverdue && <AlertCircle className="h-3 w-3" />}
                  <Clock className="h-3 w-3" />
                  <span>{dueInfo.text}</span>
                </div>

                {collabs.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{collabs.length} collaborator{collabs.length !== 1 ? "s" : ""}</span>
                  </div>
                )}

                {commentCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{commentCount} comment{commentCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckSquare className="h-8 w-8 text-zinc-600" />
      </div>
      <h3 className="text-lg font-medium text-zinc-200 mb-2">
        {hasFilters ? "No tasks found" : "No tasks yet"}
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
        {hasFilters ? "Try adjusting your filters to find what you're looking for." : "Create your first task to get started."}
      </p>
      {!hasFilters && (
        <Link href="/dashboard/tasks/create">
          <Button><Plus className="h-4 w-4 mr-2" />Create Task</Button>
        </Link>
      )}
    </div>
  );
}

export function TasksList() {
  // --- REAL DATA STATES ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // --- FETCH THE REAL DATA ---
  useEffect(() => {
    async function loadTasks() {
      try {
        setIsLoading(true);
        const response = await taskService.getAllTasks();
        
        if (response.success && response.data) {
          setTasks(response.data);
        } else {
          setError(response.error?.message || "Failed to load tasks");
        }
      } catch (err) {
        setError("Network error connecting to the server.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTasks();
  }, []);

  // Filter tasks using our real 'tasks' array
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = task.title.toLowerCase().includes(query) || (task.description?.toLowerCase().includes(query) || false);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [searchQuery, statusFilter, priorityFilter, tasks]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (b.status === "completed" && a.status !== "completed") return -1;
      
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [filteredTasks]);

  const hasFilters = Boolean(searchQuery || statusFilter !== "all" || priorityFilter !== "all");
  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearchQuery("");
  };

  // Live Stats!
  const stats = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      inReview: tasks.filter((t) => t.status === "in_review").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  // Show an error if the connection fails
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">Tasks</h1>
          <p className="text-sm text-zinc-500">Create and manage tasks for your community.</p>
        </div>
        <Link href="/dashboard/tasks/create">
          <Button><Plus className="h-4 w-4 mr-2" />Create Task</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 mb-1">To Do</p>
            <p className="text-2xl font-semibold text-zinc-200">{stats.todo}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-blue-400/70 mb-1">In Progress</p>
            <p className="text-2xl font-semibold text-blue-400">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-amber-400/70 mb-1">In Review</p>
            <p className="text-2xl font-semibold text-amber-400">{stats.inReview}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-400/70 mb-1">Completed</p>
            <p className="text-2xl font-semibold text-emerald-400">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className={cn(showFilters && "bg-white/10")}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && <span className="ml-2 w-5 h-5 bg-white text-black text-xs font-medium rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </Button>
      </div>

      {showFilters && (
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Select label="Status" options={statusOptions} value={statusFilter} onChange={(value) => setStatusFilter(value)} />
              <Select label="Priority" options={priorityOptions} value={priorityFilter} onChange={(value) => setPriorityFilter(value)} />
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500" disabled={!hasFilters}>
                  <X className="h-4 w-4 mr-1" />Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- SHOW SPINNER WHILE LOADING --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading your tasks...</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}