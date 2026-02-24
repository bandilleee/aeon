"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckSquare, Calendar, Clock, Users, Edit, Trash2,
  MessageSquare, Send, AlertTriangle, Flag, Link as LinkIcon, Check, Shield, Loader2
} from "lucide-react";

import { Button, Badge, Card, CardContent, CardHeader, CardTitle, Select } from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/modal";
import { getTaskStatusBadge, getTaskPriorityBadge } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task.types";
import { taskService, TaskComment } from "@/services/tasks.service";

interface TaskDetailsProps {
  taskId: string;
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(safeDateString);
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "N/A";
  const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(safeDateString);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins <= 0) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDueDate(dateString?: string) {
  if (!dateString) return { text: "No due date", isOverdue: false, isDueSoon: false };
  const dueDate = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = dueDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (diffDays < 0) return { text: `Overdue (${formatted})`, isOverdue: true, isDueSoon: false };
  if (diffDays === 0) return { text: "Due today", isOverdue: false, isDueSoon: true };
  if (diffDays === 1) return { text: "Due tomorrow", isOverdue: false, isDueSoon: true };
  if (diffDays <= 3) return { text: `Due in ${diffDays} days`, isOverdue: false, isDueSoon: true };
  return { text: formatted, isOverdue: false, isDueSoon: false };
}

export function TaskDetails({ taskId }: TaskDetailsProps) {
  const router = useRouter();
  
  // Real Data States
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]); // <-- New state for real comments!
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TaskStatus | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch Task AND Comments on load
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Fetch task
        const taskResponse = await taskService.getTaskById(taskId);
        if (taskResponse.success && taskResponse.data) {
          setTask(taskResponse.data);
          setCurrentStatus(taskResponse.data.status);
        } else {
          setError(taskResponse.error?.message || "Task not found");
          return;
        }

        // Fetch comments
        const commentsResponse = await taskService.getTaskComments(taskId);
        if (commentsResponse.success && commentsResponse.data) {
          setComments(commentsResponse.data);
        }
      } catch (err) {
        setError("Network error connecting to the server.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [taskId]);

  // Fake current user (We will replace this when we do Auth Context later)
  const currentUser = {
    id: "user_1",
    displayName: "Bandile (Admin)",
    initials: "BA",
    isAdmin: true,
  };

  const isCreator = true; 
  const isAdmin = currentUser.isAdmin;
  const canEdit = isCreator || isAdmin;
  const canDelete = isCreator || isAdmin;
  const canChangeStatus = true; 

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-4 md:p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-lg text-zinc-200 mb-2">Task Not Found</h2>
        <Link href="/dashboard/tasks"><Button>Back to Tasks</Button></Link>
      </div>
    );
  }

  const statusBadge = getTaskStatusBadge(currentStatus || task.status);
  const priorityBadge = getTaskPriorityBadge(task.priority);
  const dueInfo = formatDueDate(task.dueDate);

// --- REAL UPDATE STATUS ---
  const handleStatusChange = async (newStatus: string) => {
    if (!canChangeStatus || !task) return;
    try {
      setIsUpdatingStatus(true);
      
      const response = await taskService.updateTask(task.id, {
        ...task,
        status: newStatus as TaskStatus
      });

      if (response.success) {
        setCurrentStatus(newStatus as TaskStatus);
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- REAL DELETE ---
  const handleDelete = async () => {
    if (!canDelete || !task) return;
    try {
      setIsDeleting(true);
      const response = await taskService.deleteTask(task.id);
      
      if (response.success) {
        router.push("/dashboard/tasks");
      } else {
        alert("Failed to delete task.");
        setShowDeleteModal(false);
      }
    } catch (error) {
      alert("Network error.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- REAL ADD COMMENT ---
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsAddingComment(true);
      
      const response = await taskService.addTaskComment({
        taskId: taskId,
        content: newComment,
        userId: currentUser.id,
        userDisplayName: currentUser.displayName,
        userInitials: currentUser.initials
      });

      if (response.success && response.data) {
        // Add the new comment from the database straight to our list!
        setComments((prev) => [...prev, response.data]);
        setNewComment(""); // Clear the input box
      } else {
        alert("Failed to post comment.");
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setIsAddingComment(false);
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <Link href="/dashboard/tasks" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Tasks
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={priorityBadge.variant}><Flag className="h-3 w-3 mr-1" />{priorityBadge.label}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{task.title}</h1>
              <p className="text-sm text-zinc-500 mt-2">Created • {formatRelativeTime(task.createdAt)}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <Select placeholder="Change status" options={statusOptions} value={currentStatus || task.status} onChange={handleStatusChange} disabled={isUpdatingStatus} />
              </div>
              <Link href={`/dashboard/tasks/${taskId}/edit`}>
                <Button variant="secondary" size="icon" title="Edit task"><Edit className="h-4 w-4" /></Button>
              </Link>
              <Button variant="secondary" size="icon" onClick={() => setShowDeleteModal(true)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20" title="Delete task">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{task.description}</p></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Comments ({comments.length})</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">No comments yet. Be the first to comment!</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10 flex-shrink-0">
                          {/* Use our new real C# properties! */}
                          {comment.userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-zinc-200">{comment.userDisplayName}</span>
                            <span className="text-xs text-zinc-600">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-zinc-400">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Comment Input */}
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
                      <Button size="sm" onClick={handleAddComment} isLoading={isAddingComment} disabled={!newComment.trim()} rightIcon={<Send className="h-3 w-3" />}>Send</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg border", dueInfo.isOverdue ? "bg-red-500/10 border-red-500/20" : dueInfo.isDueSoon ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/5")}>
                      <Calendar className={cn("h-4 w-4", dueInfo.isOverdue ? "text-red-400" : dueInfo.isDueSoon ? "text-amber-400" : "text-zinc-400")} />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">Due Date</p>
                      <p className={cn("text-xs", dueInfo.isOverdue ? "text-red-400" : dueInfo.isDueSoon ? "text-amber-400" : "text-zinc-500")}>{dueInfo.text}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Clock className="h-4 w-4 text-zinc-400" /></div>
                    <div>
                      <p className="text-sm text-zinc-200">Created</p>
                      <p className="text-xs text-zinc-500">{formatDate(task.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Task?" description="This action cannot be undone. All task data will be permanently deleted." confirmText="Delete Task" cancelText="Cancel" variant="danger" isLoading={isDeleting} />
    </>
  );
}