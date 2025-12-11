"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Send,
  Save,
  CheckCircle,
  Info,
} from "lucide-react";
import Link from "next/link";

import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  Card,
  CardContent,
} from "@/components/ui";
import { ConfirmationModal, Modal } from "@/components/ui/modal";
import { createEventSchema, CreateEventFormData } from "@/lib/validations";

/**
 * Category options
 */
const categoryOptions = [
  { value: "meeting", label: "Meeting" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "training", label: "Training" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Other" },
];

/**
 * Visibility options
 */
const visibilityOptions = [
  { value: "public", label: "Public - Visible to everyone" },
  { value: "members_only", label: "Members Only - Visible to members" },
  { value: "invite_only", label: "Invite Only - By invitation" },
];

export function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<CreateEventFormData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      isVirtual: false,
      location: "",
      virtualLink: "",
      visibility: undefined,
      maxAttendees: undefined,
      requiresRegistration: true,
    },
    mode: "onBlur",
  });

  const isVirtual = watch("isVirtual");
  const requiresRegistration = watch("requiresRegistration");

  /**
   * Handle form submission - shows confirmation modal
   */
  const onSubmit = (data: CreateEventFormData) => {
    setFormData(data);
    setShowConfirmModal(true);
  };

  /**
   * Confirm and submit the event
   */
  const handleConfirmSubmit = async () => {
    if (!formData) return;

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      // TODO: Replace with actual API call to your C# backend
      console.log("Creating event:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Save as draft
   */
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);

      // Get current form values even if invalid
      const currentData = watch();

      // TODO: Replace with actual API call
      console.log("Saving draft:", currentData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/dashboard/events");
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  /**
   * Handle success modal close
   */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/events");
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Create Event
          </h1>
          <p className="text-sm text-zinc-500">
            Fill out the form below to create a new event. Events require admin
            approval before being published.
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-400/90 font-medium">
                Approval Required
              </p>
              <p className="text-xs text-blue-400/70 mt-1">
                Your event will be reviewed by an administrator before it
                becomes visible to members. You'll receive a notification once
                it's approved.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-zinc-500" />
                Basic Information
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <Input
                  label="Event Title"
                  placeholder="Enter a descriptive title for your event"
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
                      placeholder="Describe your event, what attendees can expect, and any important details..."
                      rows={5}
                      showCount
                      maxLength={2000}
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />

                {/* Category */}
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Category"
                      placeholder="Select a category"
                      options={categoryOptions}
                      error={errors.category?.message}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-zinc-500" />
                Date & Time
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <Input
                  label="Start Date"
                  type="date"
                  error={errors.startDate?.message}
                  {...register("startDate")}
                />

                {/* Start Time */}
                <Input
                  label="Start Time"
                  type="time"
                  error={errors.startTime?.message}
                  {...register("startTime")}
                />

                {/* End Date */}
                <Input
                  label="End Date"
                  type="date"
                  error={errors.endDate?.message}
                  {...register("endDate")}
                />

                {/* End Time */}
                <Input
                  label="End Time"
                  type="time"
                  error={errors.endTime?.message}
                  {...register("endTime")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-500" />
                Location
              </h2>

              <div className="space-y-6">
                {/* Virtual Toggle */}
                <Controller
                  name="isVirtual"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      label="This is a virtual event"
                      description="Virtual events will include a meeting link instead of a physical location."
                    />
                  )}
                />

                {/* Location or Virtual Link */}
                {isVirtual ? (
                  <Input
                    label="Meeting Link"
                    placeholder="https://zoom.us/j/..."
                    leftIcon={<Video className="h-4 w-4" />}
                    error={errors.virtualLink?.message}
                    {...register("virtualLink")}
                  />
                ) : (
                  <Input
                    label="Location"
                    placeholder="Enter the venue address or room name"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    error={errors.location?.message}
                    {...register("location")}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registration & Visibility */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-zinc-200 mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-zinc-500" />
                Registration & Visibility
              </h2>

              <div className="space-y-6">
                {/* Visibility */}
                <Controller
                  name="visibility"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Visibility"
                      placeholder="Who can see this event?"
                      options={visibilityOptions}
                      error={errors.visibility?.message}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {/* Requires Registration */}
                <Controller
                  name="requiresRegistration"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      label="Require registration"
                      description="Attendees must register before attending this event."
                    />
                  )}
                />

                {/* Max Attendees */}
                {requiresRegistration && (
                  <Controller
                    name="maxAttendees"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Maximum Attendees (optional)"
                        type="number"
                        placeholder="Leave empty for unlimited"
                        leftIcon={<Users className="h-4 w-4" />}
                        error={errors.maxAttendees?.message}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value, 10) : null);
                        }}
                      />
                    )}
                  />
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
              <Link href="/dashboard/events">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                isLoading={isSubmitting}
                rightIcon={<Send className="h-4 w-4" />}
              >
                Submit for Approval
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Event for Approval?"
        description="Your event will be sent to an administrator for review. You'll be notified once it's approved."
        confirmText="Submit Event"
        cancelText="Go Back"
        isLoading={isSubmitting}
      />

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center py-4">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            Event Submitted! 
          </h3>

          {/* Description */}
          <p className="text-sm text-zinc-400 mb-6">
            Your event has been submitted for approval. You'll receive an
            email once an administrator reviews it. 
          </p>

          {/* What happens next */}
          <div className="bg-zinc-800/50 border border-white/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">
              What happens next? 
            </p>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">1.</span>
                <span>An admin will review your event</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">2.</span>
                <span>You'll be notified of the decision</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">3.</span>
                <span>If approved, your event goes live</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/dashboard/events/create");
                // Reset form would go here
              }}
            >
              Create Another
            </Button>
            <Button className="flex-1" onClick={handleSuccessClose}>
              View Events
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}