"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckSquare,
  Calendar,
  Users,
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2 // <-- Added spinner
} from "lucide-react";
import Link from "next/link";

import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardContent,
  MultiSelect,
} from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { createTaskSchema, CreateTaskFormData } from "@/lib/validations";
import { mockUsers, mockEvents } from "@/lib/mock-data"; 
import { taskService } from "@/services/tasks.service"; // <-- Our bridge!
import { Task } from "@/types/task.types";

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const collaboratorOptions = mockUsers.map((user) => ({
  value: user.id,
  label: user.displayName,
  description: user.email,
  icon: (
    <div className="w-6 h-6 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/10">
      {user.initials}
    </div>
  ),
}));

const eventOptions = [
  { value: "", label: "No linked event" },
  ...mockEvents.filter((event) => event.status === "approved").map((event) => ({ value: event.id, label: event.title })),
];

interface EditTaskFormProps {
  taskId: string;
}

export function EditTaskForm({ taskId }: EditTaskFormProps) {
  const router = useRouter();
  
  // --- REAL DATA STATES ---
  const [task, setTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- FORM SETUP ---
  // We initialize the form with empty strings. Once the task loads, we "reset" the form with the real data!
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: "", description: "", status: "todo", priority: "medium", dueDate: "", collaboratorIds: [], eventId: "" },
    mode: "onBlur",
  });

  // --- FETCH TASK DATA ---
  useEffect(() => {
    async function fetchTask() {
      try {
        setIsLoadingTask(true);
        const response = await taskService.getTaskById(taskId);
        
        if (response.success && response.data) {
          const fetchedTask = response.data;
          setTask(fetchedTask);
          
          // Fill the form inputs with the data from C#!
          reset({
            title: fetchedTask.title,
            description: fetchedTask.description || "",
            status: fetchedTask.status,
            priority: fetchedTask.priority,
            dueDate: fetchedTask.dueDate ? fetchedTask.dueDate.split("T")[0] : "",
            collaboratorIds: fetchedTask.collaborators?.map((c) => c.userId) || [],
            eventId: fetchedTask.eventId || "",
          });
        } else {
          setError(response.error?.message || "Task not found");
        }
      } catch (err) {
        setError("Network error connecting to the server.");
      } finally {
        setIsLoadingTask(false);
      }
    }

    fetchTask();
  }, [taskId, reset]);

  const selectedCollaborators = watch("collaboratorIds");

  // --- LOADING STATE ---
  if (isLoadingTask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading task...</p>
      </div>
    );
  }

  // --- ERROR / NOT FOUND STATE ---
  if (error || !task) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-medium text-zinc-200 mb-2">Task Not Found</h2>
          <p className="text-sm text-zinc-500 mb-6">{error || "The task you're trying to edit doesn't exist."}</p>
          <Link href="/dashboard/tasks"><Button>Back to Tasks</Button></Link>
        </div>
      </div>
    );
  }

  // --- UPDATE TASK ---
  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      setIsSubmitting(true);

      // Merge the original task ID and dates with our newly edited data
      const updatedTaskData = {
        ...task,
        title: data.title,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
      };

      const response = await taskService.updateTask(taskId, updatedTaskData);

      if (response.success) {
        setShowSuccessModal(true);
      } else {
        alert(`Failed to update task: ${response.error?.message}`);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push(`/dashboard/tasks/${taskId}`); // Send them back to the detail page!
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href={`/dashboard/tasks/${taskId}`} className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Task
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">Edit Task</h1>
          <p className="text-sm text-zinc-500">Update the details of your task.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2"><CheckSquare className="h-5 w-5 text-zinc-500" /> Task Details</h2>
              <div className="space-y-6">
                <Input label="Task Title" placeholder="Enter a clear, descriptive title" error={errors.title?.message} {...register("title")} />
                <Controller name="description" control={control} render={({ field }) => (
                    <Textarea label="Description" placeholder="Describe the task in detail..." rows={5} showCount maxLength={2000} error={errors.description?.message} {...field} />
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller name="status" control={control} render={({ field }) => (
                      <Select label="Status" placeholder="Select status" options={statusOptions} error={errors.status?.message} value={field.value} onChange={field.onChange} />
                    )}
                  />
                  <Controller name="priority" control={control} render={({ field }) => (
                      <Select label="Priority" placeholder="Select priority" options={priorityOptions} error={errors.priority?.message} value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2"><Calendar className="h-5 w-5 text-zinc-500" /> Schedule & Links</h2>
              <div className="space-y-6">
                <Input label="Due Date (optional)" type="date" error={errors.dueDate?.message} {...register("dueDate")} />
                <Controller name="eventId" control={control} render={({ field }) => (
                    <Select label="Link to Event (optional)" placeholder="Select an event" options={eventOptions} value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2"><Users className="h-5 w-5 text-zinc-500" /> Collaborators</h2>
              <Controller name="collaboratorIds" control={control} render={({ field }) => (
                  <MultiSelect label="Assign Collaborators" placeholder="Select team members" options={collaboratorOptions} value={field.value} onChange={field.onChange} />
                )}
              />
              {selectedCollaborators?.length > 0 && (
                <div className="mt-4 p-4 bg-zinc-900/50 border border-white/5 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-3">{selectedCollaborators.length} collaborator{selectedCollaborators.length !== 1 ? "s" : ""} selected:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollaborators.map((userId) => {
                      const user = mockUsers.find((u) => u.id === userId);
                      if (!user) return null;
                      return (
                        <div key={userId} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                          <div className="w-5 h-5 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[8px] text-white font-bold">{user.initials}</div>
                          <span className="text-xs text-zinc-300">{user.displayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-white/5">
            <Link href={`/dashboard/tasks/${taskId}`}>
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty} leftIcon={<Save className="h-4 w-4" />}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={showSuccessModal} onClose={handleSuccessClose} size="sm" showCloseButton={false}>
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">Task Updated!</h3>
          <p className="text-sm text-zinc-400 mb-6">Your task has been successfully updated.</p>
          <Button className="w-full" onClick={handleSuccessClose}>View Task</Button>
        </div>
      </Modal>
    </>
  );
}