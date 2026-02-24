"use client";
import { taskService } from "@/services/tasks.service"; 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckSquare,
  Calendar,
  Users,
  Flag,
  Link as LinkIcon,
  Save,
  Plus,
  CheckCircle,
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
import { ConfirmationModal, Modal } from "@/components/ui/modal";
import { createTaskSchema, CreateTaskFormData } from "@/lib/validations";
import { mockUsers, mockEvents } from "@/lib/mock-data";

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
  { value: "low", label: "Low", description: "No immediate deadline" },
  { value: "medium", label: "Medium", description: "Should be done soon" },
  { value: "high", label: "High", description: "Needs attention" },
  { value: "urgent", label: "Urgent", description: "Critical priority" },
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

export function CreateTaskForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      collaboratorIds: [],
      eventId: "",
    },
    mode: "onBlur",
  });

  const selectedCollaborators = watch("collaboratorIds");

  /**
   * Handle form submission (NOW CONNECTED TO C# BACKEND!)
   */
  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      setIsSubmitting(true);

      // 1. Send the form data to our C# backend
      const response = await taskService.createTask({
        title: data.title,
        description: data.description || "", // Provide empty string fallback
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || undefined, // Send undefined if empty
        collaboratorIds: data.collaboratorIds || [],
        eventId: data.eventId || undefined,
        // Note: Our C# backend doesn't support collaborators or linked events yet,
        // but we send the core task data!
      });

      // 2. Check if the C# bouncer approved it
      if (response.success) {
        setShowSuccessModal(true); // Show the nice green checkmark modal!
      } else {
        // If the backend threw an error (like a validation error), alert the user
        alert(`Failed to save task: ${response.error?.message || "Unknown error"}`);
      }

    } catch (error) {
      console.error("Failed to create task:", error);
      alert("A network error occurred. Is your server running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Save as draft (status = todo)
   */
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);

      const currentData = watch();
      
      // We must have at least a title to save a draft
      if (!currentData.title) {
        alert("Please enter a title before saving a draft.");
        return;
      }

      const response = await taskService.createTask({
        title: currentData.title,
        description: currentData.description || "",
        status: "todo", // Force status to todo for drafts
        priority: currentData.priority || "medium",
        dueDate: currentData.dueDate || undefined,
        collaboratorIds: currentData.collaboratorIds || [],
        eventId: currentData.eventId || undefined,
      });

      if (response.success) {
        router.push("/dashboard/tasks"); // Take them back to the list
      } else {
        alert(`Failed to save draft: ${response.error?.message || "Unknown error"}`);
      }

    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  /**
   * Handle success modal - create another
   */
  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    reset();
  };

  /**
   * Handle success modal - view tasks
   */
  const handleViewTasks = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/tasks");
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Link>

          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Create Task
          </h1>
          <p className="text-sm text-zinc-500">
            Create a new task and assign it to team members.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-zinc-500" />
                Task Details
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <Input
                  label="Task Title"
                  placeholder="Enter a clear, descriptive title"
                  error={errors.title?.message}
                  {...register("title")}
                />

                {/* Description */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="Description"
                      placeholder="Describe the task in detail. What needs to be done? What are the requirements?"
                      rows={5}
                      showCount
                      maxLength={2000}
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />

                {/* Status and Priority in a grid */}
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

          {/* Due Date & Event Link */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-zinc-500" />
                Schedule & Links
              </h2>

              <div className="space-y-6">
                {/* Due Date */}
                <Input
                  label="Due Date (optional)"
                  type="date"
                  error={errors.dueDate?.message}
                  {...register("dueDate")}
                />

                {/* Link to Event */}
                <Controller
                  name="eventId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Link to Event (optional)"
                      placeholder="Select an event"
                      options={eventOptions}
                      hint="Link this task to an existing event"
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

              <div className="space-y-6">
                <Controller
                  name="collaboratorIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      label="Assign Collaborators"
                      placeholder="Select team members"
                      options={collaboratorOptions}
                      hint="Choose team members to collaborate on this task"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {/* Selected collaborators preview */}
                {selectedCollaborators.length > 0 && (
                  <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-3">
                      {selectedCollaborators.length} collaborator{selectedCollaborators.length !== 1 ? "s" : ""} selected:
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
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              isLoading={isSavingDraft}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save as Draft
            </Button>

            <div className="flex gap-3">
              <Link href="/dashboard/tasks">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                isLoading={isSubmitting}
                rightIcon={<Plus className="h-4 w-4" />}
              >
                Create Task
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleViewTasks}
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>

          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            Task Created!
          </h3>

          <p className="text-sm text-zinc-400 mb-6">
            Your task has been created successfully.
            {selectedCollaborators.length > 0 &&
              ` ${selectedCollaborators.length} collaborator${selectedCollaborators.length !== 1 ? "s have" : " has"} been notified.`}
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleCreateAnother}
            >
              Create Another
            </Button>
            <Button className="flex-1" onClick={handleViewTasks}>
              View Tasks
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}