"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  AlertTriangle,
  Flag,
  Link as LinkIcon,
  Check,
  Shield,
} from "lucide-react";

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
} from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/modal";
import {
  mockTasks,
  mockTaskComments,
  getTaskStatusBadge,
  getTaskPriorityBadge,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types/task.types";

interface TaskDetailsProps {
  taskId: string;
}

/**
 * Status options for quick change
 */
const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format due date with status
 */
function formatDueDate(dateString?: string): {
  text: string;
  isOverdue: boolean;
  isDueSoon: boolean;
} {
  if (!dateString)
    return { text: "No due date", isOverdue: false, isDueSoon: false };

  const dueDate = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatted = dueDate.toLocaleDateString("en-US", {
    weekday: "short",
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

export function TaskDetails({ taskId }: TaskDetailsProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TaskStatus | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Find the task
  const task = useMemo(() => {
    return mockTasks.find((t) => t.id === taskId);
  }, [taskId]);

  // Get comments for this task
  const comments = useMemo(() => {
    return mockTaskComments.filter((c) => c.taskId === taskId);
  }, [taskId]);

  /**
   * Mock current user - In production, this comes from your auth context/store
   * 
   * TODO: Replace with actual auth context
   * Example: 
   * const { user } = useAuth();
   * const currentUser = {
   *   id: user.id,
   *   displayName: user.displayName,
   *   initials: user.initials,
   *   isAdmin: user.role === 'admin',
   * };
   */
  const currentUser = {
    id: "user_1",
    displayName: "Jane Doe",
    initials: "JD",
    isAdmin: false, // Toggle this to test admin functionality
  };

  // Check if current user is the creator
  const isCreator = task?.createdBy === currentUser.id;

  // Check if current user is an admin
  const isAdmin = currentUser.isAdmin;

  // Can edit:  Creator OR Admin
  const canEdit = isCreator || isAdmin;

  // Can delete: Creator OR Admin
  const canDelete = isCreator || isAdmin;

  // Can change status: Creator, Admin, or Collaborator (assignee/reviewer)
  const isCollaborator = task?.collaborators.some(
    (c: any) => c.userId === currentUser.id
  );
  const canChangeStatus = isCreator || isAdmin || isCollaborator;

  // Initialize status
  useEffect(() => {
    if (task && !currentStatus) {
      setCurrentStatus(task.status);
    }
    // Only run when `task` is available and `currentStatus` is null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  if (!task) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-medium text-zinc-200 mb-2">
            Task Not Found
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            The task you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/dashboard/tasks">
            <Button>Back to Tasks</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getTaskStatusBadge(currentStatus || task.status);
  const priorityBadge = getTaskPriorityBadge(task.priority);
  const dueInfo = formatDueDate(task.dueDate);

  /**
   * Handle status change
   */
  const handleStatusChange = async (newStatus: string) => {
    if (!canChangeStatus) return;

    try {
      setIsUpdatingStatus(true);

      // TODO: Replace with actual API call
      console.log("Updating status:", newStatus);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentStatus(newStatus as TaskStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Handle delete task
   */
  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      setIsDeleting(true);

      // TODO:  Replace with actual API call
      console.log("Deleting task:", taskId);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push("/dashboard/tasks");
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  /**
   * Handle add comment
   */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsAddingComment(true);

      // TODO:  Replace with actual API call
      console.log("Adding comment:", newComment);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Title and badges */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={priorityBadge.variant}>
                  <Flag className="h-3 w-3 mr-1" />
                  {priorityBadge.label}
                </Badge>
                {task.eventTitle && (
                  <Badge variant="info">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    {task.eventTitle}
                  </Badge>
                )}
                {/* Show admin badge if viewing as admin */}
                {isAdmin && !isCreator && (
                  <Badge variant="warning">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin Access
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                {task.title}
              </h1>

              {/* Creator info */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/10">
                  {task.createdByUser.initials}
                </div>
                <span className="text-sm text-zinc-500">
                  Created by{" "}
                  <span className="text-zinc-300">
                    {task.createdByUser.displayName}
                  </span>
                  {isCreator && (
                    <span className="text-zinc-600"> (You)</span>
                  )}
                  {" • "}
                  {formatRelativeTime(task.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Quick status change - only if user can change status */}
              {canChangeStatus && (
                <div className="w-40">
                  <Select
                    placeholder="Change status"
                    options={statusOptions}
                    value={currentStatus || task.status}
                    onChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                  />
                </div>
              )}

              {/* Edit button - only if user can edit */}
              {canEdit && (
                <Link href={`/dashboard/tasks/${taskId}/edit`}>
                  <Button variant="secondary" size="icon" title="Edit task">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              {/* Delete button - only if user can delete */}
              {canDelete && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comments list */}
                {comments.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10 flex-shrink-0">
                          {comment.user.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-zinc-200">
                              {comment.user.displayName}
                            </span>
                            <span className="text-xs text-zinc-600">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment - everyone can comment */}
                <div className="flex items-start gap-3 pt-4 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10 flex-shrink-0">
                    {currentUser.initials}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-black/20 border border-white/10 rounded-md text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        isLoading={isAddingComment}
                        disabled={!newComment.trim()}
                        rightIcon={<Send className="h-3 w-3" />}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Due Date */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Due date */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg border",
                        dueInfo.isOverdue
                          ? "bg-red-500/10 border-red-500/20"
                          : dueInfo.isDueSoon
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-white/5 border-white/5"
                      )}
                    >
                      <Calendar
                        className={cn(
                          "h-4 w-4",
                          dueInfo.isOverdue
                            ? "text-red-400"
                            : dueInfo.isDueSoon
                            ? "text-amber-400"
                            : "text-zinc-400"
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">Due Date</p>
                      <p
                        className={cn(
                          "text-xs",
                          dueInfo.isOverdue
                            ? "text-red-400"
                            : dueInfo.isDueSoon
                            ? "text-amber-400"
                            : "text-zinc-500"
                        )}
                      >
                        {dueInfo.text}
                      </p>
                    </div>
                  </div>

                  {/* Created */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <Clock className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">Created</p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Completed */}
                  {task.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Check className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-200">Completed</p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(task.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Collaborators */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Collaborators ({task.collaborators.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {task.collaborators.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">
                    No collaborators assigned
                  </p>
                ) : (
                  <div className="space-y-2">
                    {task.collaborators.map((collab: any) => (
                      <div
                        key={collab.id}
                        className="flex items-center justify-between p-2 bg-zinc-900/50 border border-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[9px] text-white font-bold border border-white/10">
                            {collab.user.initials}
                          </div>
                          <div>
                            <p className="text-sm text-zinc-300">
                              {collab.user.displayName}
                              {collab.userId === currentUser.id && (
                                <span className="text-zinc-600 ml-1">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-zinc-600">
                              {collab.user.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            collab.role === "assignee"
                              ? "info"
                              : collab.role === "reviewer"
                              ? "warning"
                              : "neutral"
                          }
                        >
                          {collab.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Linked Event */}
            {task.eventId && task.eventTitle && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Linked Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/dashboard/events/${task.eventId}`}
                    className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">{task.eventTitle}</p>
                      <p className="text-xs text-zinc-500">View event →</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Permissions Info Card */}
            <Card className="bg-zinc-900/30">
              <CardContent className="p-4">
                <p className="text-xs text-zinc-600 mb-2">Your permissions: </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        canEdit ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    />
                    <span className={canEdit ? "text-zinc-400" : "text-zinc-600"}>
                      {canEdit ? "Can edit" : "Cannot edit"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        canDelete ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    />
                    <span className={canDelete ? "text-zinc-400" : "text-zinc-600"}>
                      {canDelete ? "Can delete" : "Cannot delete"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        canChangeStatus ? "bg-emerald-500" : "bg-zinc-700"
                      )}
                    />
                    <span className={canChangeStatus ? "text-zinc-400" : "text-zinc-600"}>
                      {canChangeStatus
                        ? "Can change status"
                        : "Cannot change status"}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <p className="text-xs text-amber-500/70 mt-3 pt-3 border-t border-white/5">
                    <Shield className="h-3 w-3 inline mr-1" />
                    You have admin privileges
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Task?"
        description={
          isAdmin && !isCreator
            ? "You are deleting this task using admin privileges. This action cannot be undone."
            : "This action cannot be undone. All task data and comments will be permanently deleted."
        }
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}