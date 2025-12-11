"use client";

import { useState, useMemo, useEffect } from "react";
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
import { mockTasks, mockUsers, mockEvents } from "@/lib/mock-data";

/**
 * Status options
 */
const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
];

/**
 * Priority options
 */
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

/**
 * Convert users to multi-select options
 */
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

/**
 * Convert events to select options
 */
const eventOptions = [
  { value: "", label: "No linked event" },
  ...mockEvents
    .filter((event) => event.status === "approved")
    .map((event) => ({
      value: event.id,
      label: event.title,
    })),
];

interface EditTaskFormProps {
  taskId: string;
}

export function EditTaskForm({ taskId }: EditTaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Find the task
  const task = useMemo(() => {
    return mockTasks.find((t) => t.id === taskId);
  }, [taskId]);

  // Get default values from task
  const getDefaultValues = (): CreateTaskFormData => {
    if (!task) {
      return {
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        collaboratorIds: [],
        eventId: "",
      };
    }

    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      collaboratorIds: task.collaborators.map((c) => c.userId),
      eventId: task.eventId || "",
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: getDefaultValues(),
    mode: "onBlur",
  });

  // Reset form when task loads
  useEffect(() => {
    if (task) {
      reset(getDefaultValues());
    }
  }, [task]);

  const selectedCollaborators = watch("collaboratorIds");

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
            The task you're trying to edit doesn't exist or has been removed.
          </p>
          <Link href="/dashboard/tasks">
            <Button>Back to Tasks</Button>
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Replace with actual API call
      console.log("Updating task:", { id: taskId, ...data });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle success modal close
   */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push(`/dashboard/tasks/${taskId}`);
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/tasks/${taskId}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Task
          </Link>

          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Edit Task
          </h1>
          <p className="text-sm text-zinc-500">
            Update the details of your task.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Task Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-zinc-500" />
                Task Details
              </h2>

              <div className="space-y-6">
                <Input
                  label="Task Title"
                  placeholder="Enter a clear, descriptive title"
                  error={errors.title?.message}
                  {...register("title")}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="Description"
                      placeholder="Describe the task in detail..."
                      rows={5}
                      showCount
                      maxLength={2000}
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Status"
                        placeholder="Select status"
                        options={statusOptions}
                        error={errors.status?.message}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Priority"
                        placeholder="Select priority"
                        options={priorityOptions}
                        error={errors.priority?.message}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Links */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-zinc-500" />
                Schedule & Links
              </h2>

              <div className="space-y-6">
                <Input
                  label="Due Date (optional)"
                  type="date"
                  error={errors.dueDate?.message}
                  {...register("dueDate")}
                />

                <Controller
                  name="eventId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Link to Event (optional)"
                      placeholder="Select an event"
                      options={eventOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Collaborators */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-zinc-500" />
                Collaborators
              </h2>

              <Controller
                name="collaboratorIds"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    label="Assign Collaborators"
                    placeholder="Select team members"
                    options={collaboratorOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {/* Selected collaborators preview */}
              {selectedCollaborators.length > 0 && (
                <div className="mt-4 p-4 bg-zinc-900/50 border border-white/5 rounded-lg">
                  <p className="text-xs text-zinc-500 mb-3">
                    {selectedCollaborators.length} collaborator
                    {selectedCollaborators.length !== 1 ? "s" : ""} selected:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollaborators.map((userId) => {
                      const user = mockUsers.find((u) => u.id === userId);
                      if (!user) return null;
                      return (
                        <div
                          key={userId}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full"
                        >
                          <div className="w-5 h-5 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[8px] text-white font-bold">
                            {user.initials}
                          </div>
                          <span className="text-xs text-zinc-300">
                            {user.displayName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-white/5">
            <Link href={`/dashboard/tasks/${taskId}`}>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!isDirty}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>

          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            Task Updated!
          </h3>

          <p className="text-sm text-zinc-400 mb-6">
            Your task has been successfully updated.
          </p>

          <Button className="w-full" onClick={handleSuccessClose}>
            View Task
          </Button>
        </div>
      </Modal>
    </>
  );
}