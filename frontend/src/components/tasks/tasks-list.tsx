"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button, Badge, Card, CardContent, Select } from "@/components/ui";
import { mockTasks, getTaskStatusBadge, getTaskPriorityBadge, mockUsers } from "@/lib/mock-data";
import { Task, TaskStatus, TaskPriority } from "@/types/task.types";
import { cn } from "@/lib/utils";

/**
 * Status filter options
 */
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

/**
 * Priority filter options
 */
const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

/**
 * Format due date
 */
function formatDueDate(dateString?: string): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  if (!dateString) return { text: "No due date", isOverdue: false, isDueSoon: false };

  const dueDate = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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

/**
 * Task Card Component
 */
function TaskCard({ task }: { task: Task }) {
  const statusBadge = getTaskStatusBadge(task.status);
  const priorityBadge = getTaskPriorityBadge(task.priority);
  const dueInfo = formatDueDate(task.dueDate);

  return (
    <Link href={`/dashboard/tasks/${task.id}`}>
      <Card variant="hover" className="group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Status indicator */}
            <div
              className={cn(
                "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0",
                task.status === "completed"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : task.status === "in_progress"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : task.status === "in_review"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-white/5 border-white/10 text-zinc-500"
              )}
            >
              <CheckSquare className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                {task.eventTitle && (
                  <Badge variant="info">
                    <Calendar className="h-3 w-3 mr-1" />
                    {task.eventTitle}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-medium text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                {task.title}
              </h3>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500">
                {/* Due date */}
                <div
                  className={cn(
                    "flex items-center gap-1",
                    dueInfo.isOverdue && "text-red-400",
                    dueInfo.isDueSoon && !dueInfo.isOverdue && "text-amber-400"
                  )}
                >
                  {dueInfo.isOverdue && <AlertCircle className="h-3 w-3" />}
                  <Clock className="h-3 w-3" />
                  <span>{dueInfo.text}</span>
                </div>

                {/* Collaborators */}
                {task.collaborators.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{task.collaborators.length} collaborator{task.collaborators.length !== 1 ? "s" : ""}</span>
                  </div>
                )}

                {/* Comments */}
                {task.commentsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <span>{task.commentsCount} comment{task.commentsCount !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Collaborator avatars */}
            {task.collaborators.length > 0 && (
              <div className="hidden sm:flex -space-x-2">
                {task.collaborators.slice(0, 3).map((collab) => (
                  <div
                    key={collab.id}
                    className="w-7 h-7 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[9px] text-white font-bold border-2 border-aeon-bg-primary"
                    title={collab.user.displayName}
                  >
                    {collab.user.initials}
                  </div>
                ))}
                {task.collaborators.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 font-medium border-2 border-aeon-bg-primary">
                    +{task.collaborators.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Arrow */}
            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Empty State Component
 */
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
        {hasFilters
          ? "Try adjusting your filters to find what you're looking for."
          : "Create your first task to get started."}
      </p>
      {!hasFilters && (
        <Link href="/dashboard/tasks/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </Link>
      )}
    </div>
  );
}

/**
 * Tasks List Component
 */
export function TasksList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, priorityFilter]);

  // Sort tasks: urgent/high priority first, then by due date
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (b.status === "completed" && a.status !== "completed") return -1;

      // Priority order
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Due date (earlier first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
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

  // Task stats
  const stats = useMemo(() => {
    return {
      total: mockTasks.length,
      todo: mockTasks.filter((t) => t.status === "todo").length,
      inProgress: mockTasks.filter((t) => t.status === "in_progress").length,
      inReview: mockTasks.filter((t) => t.status === "in_review").length,
      completed: mockTasks.filter((t) => t.status === "completed").length,
    };
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Tasks
          </h1>
          <p className="text-sm text-zinc-500">
            Create and manage tasks for your community.
          </p>
        </div>
        <Link href="/dashboard/tasks/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </Link>
      </div>

      {/* Stats */}
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "bg-white/10")}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 w-5 h-5 bg-white text-black text-xs font-medium rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Status Filter */}
              <Select
                label="Status"
                placeholder="Select status"
                options={statusOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              />

              {/* Priority Filter */}
              <Select
                label="Priority"
                placeholder="Select priority"
                options={priorityOptions}
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value)}
              />

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-zinc-500"
                  disabled={!hasFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {sortedTasks.length} task{sortedTasks.length !== 1 ? "s" : ""} found
        </p>

        {/* Active filters pills */}
        {hasFilters && (
          <div className="flex items-center gap-2">
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
              >
                {statusOptions.find((s) => s.value === statusFilter)?.label}
                <X className="h-3 w-3" />
              </button>
            )}
            {priorityFilter !== "all" && (
              <button
                onClick={() => setPriorityFilter("all")}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
              >
                {priorityOptions.find((p) => p.value === priorityFilter)?.label}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
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