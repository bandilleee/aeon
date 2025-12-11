"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Edit,
  Trash2,
  UserCheck,
  Share2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserMinus,
} from "lucide-react";

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/modal";
import {
  mockEvents,
  mockAttendees,
  getEventStatusBadge,
  getEventCategoryBadge,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { EventAttendee } from "@/types/event.types";

interface EventDetailsProps {
  eventId: string;
}

/**
 * Format date for display
 */
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format time for display
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get duration between two dates
 */
function getDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours === 0) {
    return `${diffMinutes} minutes`;
  } else if (diffMinutes === 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  } else {
    return `${diffHours}h ${diffMinutes}m`;
  }
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelRegistrationModal, setShowCancelRegistrationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Local state for registration status (in real app, this would come from API)
  const [localIsRegistered, setLocalIsRegistered] = useState(false);

  // Find the event
  const event = useMemo(() => {
    return mockEvents.find((e) => e.id === eventId);
  }, [eventId]);

  // Get attendees for this event
  const [attendees, setAttendees] = useState<EventAttendee[]>(() => 
    mockAttendees.filter((a) => a.eventId === eventId)
  );

  // Mock current user
  const currentUser = {
    id: "user_1",
    displayName: "Jane Doe",
    email: "jane@example.com",
    initials: "JD",
  };

  // Check if current user is the creator
  const isCreator = event?.createdBy === currentUser.id;

  // Check if user is registered (from attendees list or local state)
  const isRegistered = localIsRegistered || attendees.some((a) => a.userId === currentUser.id);

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
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/dashboard/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = getEventStatusBadge(event.status);
  const categoryBadge = getEventCategoryBadge(event.category);

  /**
   * Handle delete event
   */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // TODO: Replace with actual API call
      console.log("Deleting event:", eventId);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push("/dashboard/events");
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  /**
   * Handle register for event
   */
  const handleRegister = async () => {
    try {
      setIsRegistering(true);

      // TODO: Replace with actual API call
      console.log("Registering for event:", eventId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add current user to attendees list
      const newAttendee: EventAttendee = {
        id: `att_${Date.now()}`,
        eventId: eventId,
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          displayName: currentUser.displayName,
          email: currentUser.email,
          initials: currentUser.initials,
        },
        status: "registered",
        registeredAt: new Date().toISOString(),
      };

      setAttendees((prev) => [...prev, newAttendee]);
      setLocalIsRegistered(true);

    } catch (error) {
      console.error("Failed to register:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Handle cancel registration
   */
  const handleCancelRegistration = async () => {
    try {
      setIsCancelling(true);

      // TODO: Replace with actual API call
      console.log("Cancelling registration for event:", eventId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove current user from attendees list
      setAttendees((prev) => prev.filter((a) => a.userId !== currentUser.id));
      setLocalIsRegistered(false);
      setShowCancelRegistrationModal(false);

    } catch (error) {
      console.error("Failed to cancel registration:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * Handle share event
   */
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description.slice(0, 100) + "...",
          url: url,
        });
      } catch (error) {
        // User cancelled or error
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Title and badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={categoryBadge.variant}>
                  {categoryBadge.label}
                </Badge>
                {event.isVirtual && (
                  <Badge variant="info">
                    <Video className="h-3 w-3 mr-1" />
                    Virtual
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                {event.title}
              </h1>

              {/* Creator info */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/10">
                  {event.createdByUser.initials}
                </div>
                <span className="text-sm text-zinc-500">
                  Created by{" "}
                  <span className="text-zinc-300">
                    {event.createdByUser.displayName}
                  </span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Registration Button - Only show for approved events */}
              {event.status === "approved" && event.requiresRegistration && (
                <>
                  {isRegistered ? (
                    <Button
                      variant="secondary"
                      onClick={() => setShowCancelRegistrationModal(true)}
                      leftIcon={<UserMinus className="h-4 w-4" />}
                      className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                    >
                      Cancel Registration
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRegister}
                      isLoading={isRegistering}
                      leftIcon={<UserCheck className="h-4 w-4" />}
                    >
                      Register
                    </Button>
                  )}
                </>
              )}

              {/* Registered Badge */}
              {isRegistered && (
                <Badge variant="success" className="px-3 py-1.5">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Registered
                </Badge>
              )}

              {/* Creator Actions */}
              {isCreator && (
                <>
                  <Link href={`/dashboard/events/${eventId}/check-in`}>
                    <Button variant="secondary">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Check-in
                    </Button>
                  </Link>

                  <Link href={`/dashboard/events/${eventId}/edit`}>
                    <Button variant="secondary" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
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
                <CardTitle>About this Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Attendees */}
            {event.requiresRegistration && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Attendees ({attendees.length}
                      {event.maxAttendees && ` / ${event.maxAttendees}`})
                    </CardTitle>
                    {isCreator && (
                      <Link
                        href={`/dashboard/events/${eventId}/check-in`}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Manage
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {attendees.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">
                      No registrations yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {attendees.slice(0, 5).map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10">
                              {attendee.user.initials}
                            </div>
                            <div>
                              <p className="text-sm text-zinc-200">
                                {attendee.user.displayName}
                                {attendee.userId === currentUser.id && (
                                  <span className="text-zinc-500 ml-1">(You)</span>
                                )}
                              </p>
                              <p className="text-xs text-zinc-600">
                                {attendee.user.email}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              attendee. status === "checked_in"
                                ? "success"
                                :  attendee.status === "cancelled"
                                ?  "danger"
                                :  "neutral"
                            }
                          >
                            {attendee.status === "checked_in"
                              ? "Checked In"
                              : attendee.status === "cancelled"
                              ?  "Cancelled"
                              : "Registered"}
                          </Badge>
                        </div>
                      ))}

                      {attendees.length > 5 && (
                        <Link
                          href={`/dashboard/events/${eventId}/check-in`}
                          className="block text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2"
                        >
                          View all {attendees.length} attendees
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date & Time */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">
                        {formatFullDate(event.startDate)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatTime(event.startDate)} -{" "}
                        {formatTime(event.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      <Clock className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200">Duration</p>
                      <p className="text-xs text-zinc-500">
                        {getDuration(event.startDate, event.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                      {event.isVirtual ? (
                        <Video className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <MapPin className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200">
                        {event. isVirtual ? "Virtual Event" : "Location"}
                      </p>
                      {event.isVirtual ?  (
                        event.virtualLink && (
                          <a
                            href={event.virtualLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-1"
                          >
                            Join Meeting
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )
                      ) : (
                        <p className="text-xs text-zinc-500">{event.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Attendees */}
                  {event.requiresRegistration && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <Users className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-200">Attendees</p>
                        <p className="text-xs text-zinc-500">
                          {attendees.length}
                          {event.maxAttendees
                            ? ` / ${event.maxAttendees} spots`
                            : " registered"}
                        </p>
                        {event.maxAttendees && attendees.length >= event.maxAttendees && (
                          <p className="text-xs text-amber-500 mt-1">Event is full</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardContent className="p-4">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>

            {/* Rejection Reason (if rejected) */}
            {event.status === "rejected" && event.rejectionReason && (
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-400 font-medium mb-1">
                        Event Rejected
                      </p>
                      <p className="text-xs text-red-400/70">
                        {event.rejectionReason}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        description="This action cannot be undone. All registrations and event data will be permanently deleted."
        confirmText="Delete Event"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Cancel Registration Modal */}
      <ConfirmationModal
        isOpen={showCancelRegistrationModal}
        onClose={() => setShowCancelRegistrationModal(false)}
        onConfirm={handleCancelRegistration}
        title="Cancel Registration?"
        description="Are you sure you want to cancel your registration for this event? You can register again later if spots are available."
        confirmText="Cancel Registration"
        cancelText="Go Back"
        variant="warning"
        isLoading={isCancelling}
      />
    </>
  );
}