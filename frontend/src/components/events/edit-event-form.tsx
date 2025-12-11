"use client";

import { useState, useMemo, useEffect } from "react";
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
  Save,
  AlertTriangle,
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
import { mockEvents } from "@/lib/mock-data";

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

interface EditEventFormProps {
  eventId: string;
}

export function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<CreateEventFormData | null>(null);

  // Find the event
  const event = useMemo(() => {
    return mockEvents.find((e) => e.id === eventId);
  }, [eventId]);

  // Parse date and time from event
  const getDefaultValues = (): CreateEventFormData => {
    if (!event) {
      return {
        title: "",
        description: "",
        category: "meeting",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        isVirtual: false,
        location: "",
        virtualLink: "",
        visibility: "members_only",
        maxAttendees: undefined,
        requiresRegistration: true,
      };
    }

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    return {
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split("T")[0],
      endTime: endDate.toTimeString().slice(0, 5),
      isVirtual: event.isVirtual,
      location: event.location || "",
      virtualLink: event.virtualLink || "",
      visibility: event.visibility,
      maxAttendees: event.maxAttendees,
      requiresRegistration: event.requiresRegistration,
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: getDefaultValues(),
    mode: "onBlur",
  });

  // Reset form when event loads
  useEffect(() => {
    if (event) {
      reset(getDefaultValues());
    }
  }, [event]);

  const isVirtual = watch("isVirtual");
  const requiresRegistration = watch("requiresRegistration");

  if (!event) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-medium text-zinc-200 mb-2">
            Event Not Found
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            The event you're trying to edit doesn't exist or has been removed.
          </p>
          <Link href="/dashboard/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Handle form submission
   */
  const onSubmit = (data: CreateEventFormData) => {
    setFormData(data);
    setShowConfirmModal(true);
  };

  /**
   * Confirm and save changes
   */
  const handleConfirmSubmit = async () => {
    if (!formData) return;

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      // TODO: Replace with actual API call to your C# backend
      console.log("Updating event:", { id: eventId, ...formData });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to update event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle success modal close
   */
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push(`/dashboard/events/${eventId}`);
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>

          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Edit Event
          </h1>
          <p className="text-sm text-zinc-500">
            Update the details of your event.
          </p>
        </div>

        {/* Status Info */}
        {event.status === "approved" && (
          <Card className="mb-6 bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-400/90 font-medium">
                  Event is Published
                </p>
                <p className="text-xs text-amber-400/70 mt-1">
                  This event is already approved. Major changes may require re-approval.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
                <Input
                  label="Event Title"
                  placeholder="Enter a descriptive title for your event"
                  error={errors.title?.message}
                  {...register("title")}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      label="Description"
                      placeholder="Describe your event..."
                      rows={5}
                      showCount
                      maxLength={2000}
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />

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
                <Input
                  label="Start Date"
                  type="date"
                  error={errors.startDate?.message}
                  {...register("startDate")}
                />
                <Input
                  label="Start Time"
                  type="time"
                  error={errors.startTime?.message}
                  {...register("startTime")}
                />
                <Input
                  label="End Date"
                  type="date"
                  error={errors.endDate?.message}
                  {...register("endDate")}
                />
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
                <Controller
                  name="isVirtual"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      label="This is a virtual event"
                      description="Virtual events will include a meeting link."
                    />
                  )}
                />

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

                <Controller
                  name="requiresRegistration"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      label="Require registration"
                      description="Attendees must register before attending."
                    />
                  )}
                />

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
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-white/5">
            <Link href={`/dashboard/events/${eventId}`}>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Save Changes?"
        description="Are you sure you want to save these changes to your event?"
        confirmText="Save Changes"
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
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            Changes Saved! 
          </h3>
          <p className="text-sm text-zinc-400 mb-6">
            Your event has been successfully updated. 
          </p>
          <Button className="w-full" onClick={handleSuccessClose}>
            View Event
          </Button>
        </div>
      </Modal>
    </>
  );
}