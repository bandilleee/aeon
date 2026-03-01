"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Clock, MapPin, Video, Users, Edit, Trash2, UserCheck, Share2, 
  ExternalLink, CheckCircle, XCircle, AlertTriangle, UserMinus, Loader2
} from "lucide-react";

import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/modal";
import { mockAttendees, getEventStatusBadge, getEventCategoryBadge } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Event, EventAttendee } from "@/types/event.types";
import { eventService } from "@/services/events.service";
import { useAuth } from "@/contexts/auth-context"; // Real user!

interface EventDetailsProps {
  eventId: string;
}

// --- TIMEZONE FIXED FORMATTERS ---
function formatFullDate(dateString: string): string {
  if (!dateString) return "No Date";
  const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(safeDateString);
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(dateString: string): string {
  if (!dateString) return "TBD";
  const safeDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(safeDateString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function getDuration(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "Unknown duration";
  
  const safeStart = startDate.endsWith('Z') ? startDate : `${startDate}Z`;
  const safeEnd = endDate.endsWith('Z') ? endDate : `${endDate}Z`;

  const start = new Date(safeStart);
  const end = new Date(safeEnd);
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs <= 0) return "0 minutes";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours === 0) return `${diffMinutes} minutes`;
  if (diffMinutes === 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  return `${diffHours}h ${diffMinutes}m`;
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const router = useRouter();
  const { user } = useAuth(); // Get the REAL logged-in user!
  
  // --- REAL DATA STATES ---
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelRegistrationModal, setShowCancelRegistrationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [localIsRegistered, setLocalIsRegistered] = useState(false);
  const [attendees, setAttendees] = useState<EventAttendee[]>(() => mockAttendees.filter((a) => a.eventId === eventId));

  // --- FETCH REAL EVENT ---
  useEffect(() => {
    async function fetchEvent() {
      try {
        setIsLoading(true);
        const response = await eventService.getEventById(eventId);
        
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError(response.error?.message || "Event not found");
        }
      } catch (err) {
        setError("Network error connecting to the server.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);

  // Build currentUser from real auth context
  const currentUser = {
    id: user?.id || "",
    displayName: user?.displayName || user?.firstName || "User",
    email: user?.email || "",
    initials: user?.displayName
      ? user.displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
      : "U",
  };

  // Check if current user is the creator (compare with event.createdBy)
  const isCreator = event?.createdBy === currentUser.id || user?.role === "admin";
  const isRegistered = localIsRegistered || attendees.some((a) => a.userId === currentUser.id);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading event details...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !event) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-medium text-zinc-200 mb-2">Event Not Found</h2>
          <p className="text-sm text-zinc-500 mb-6">{error || "The event you're looking for doesn't exist."}</p>
          <Link href="/dashboard/events"><Button>Back to Events</Button></Link>
        </div>
      </div>
    );
  }

  const statusBadge = getEventStatusBadge(event.status);
  const categoryBadge = getEventCategoryBadge(event.category);

  // --- REAL DELETE ---
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await eventService.deleteEvent(eventId);
      
      if (response.success) {
        router.push("/dashboard/events");
      } else {
        alert("Failed to delete event");
        setShowDeleteModal(false);
      }
    } catch (error) {
      alert("Network error.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Fake Registration (Requires backend table later)
  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newAttendee: EventAttendee = {
        id: `att_${Date.now()}`, eventId: eventId, userId: currentUser.id,
        user: { id: currentUser.id, displayName: currentUser.displayName, email: currentUser.email, initials: currentUser.initials },
        status: "registered", registeredAt: new Date().toISOString(),
      };
      setAttendees((prev) => [...prev, newAttendee]);
      setLocalIsRegistered(true);
    } finally {
      setIsRegistering(false);
    }
  };

  // Fake Cancel Registration
  const handleCancelRegistration = async () => {
    try {
      setIsCancelling(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAttendees((prev) => prev.filter((a) => a.userId !== currentUser.id));
      setLocalIsRegistered(false);
      setShowCancelRegistrationModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text: event.description.slice(0, 100) + "...", url: url }); } catch (e) {}
    } else {
      try { await navigator.clipboard.writeText(url); alert("Link copied to clipboard!"); } catch (e) {}
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/events" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={categoryBadge.variant}>{categoryBadge.label}</Badge>
                {event.isVirtual && <Badge variant="info"><Video className="h-3 w-3 mr-1" /> Virtual</Badge>}
              </div>

              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{event.title}</h1>

              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/10">
                  {/* Fallback initials */}
                  {event.createdByUser?.initials || "A"}
                </div>
                <span className="text-sm text-zinc-500">
                  Created by <span className="text-zinc-300">{event.createdByUser?.displayName || "System Admin"}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {event.status === "approved" && event.requiresRegistration && (
                <>
                  {isRegistered ? (
                    <Button variant="secondary" onClick={() => setShowCancelRegistrationModal(true)} leftIcon={<UserMinus className="h-4 w-4" />} className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10">
                      Cancel Registration
                    </Button>
                  ) : (
                    <Button onClick={handleRegister} isLoading={isRegistering} leftIcon={<UserCheck className="h-4 w-4" />}>Register</Button>
                  )}
                </>
              )}

              {isRegistered && <Badge variant="success" className="px-3 py-1.5"><CheckCircle className="h-3 w-3 mr-1" /> Registered</Badge>}

              {isCreator && (
                <>
                  <Link href={`/dashboard/events/${eventId}/check-in`}>
                    <Button variant="secondary"><UserCheck className="h-4 w-4 mr-2" /> Check-in</Button>
                  </Link>
                  <Link href={`/dashboard/events/${eventId}/edit`}>
                    <Button variant="secondary" size="icon"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="secondary" size="icon" onClick={() => setShowDeleteModal(true)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>About this Event</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{event.description}</p></CardContent>
            </Card>

            {event.requiresRegistration && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Attendees ({attendees.length}{event.maxAttendees && ` / ${event.maxAttendees}`})</CardTitle>
                    {isCreator && <Link href={`/dashboard/events/${eventId}/check-in`} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Manage</Link>}
                  </div>
                </CardHeader>
                <CardContent>
                  {attendees.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">No registrations yet</p>
                  ) : (
                    <div className="space-y-3">
                      {attendees.slice(0, 5).map((attendee) => (
                        <div key={attendee.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10">{attendee.user.initials}</div>
                            <div>
                              <p className="text-sm text-zinc-200">{attendee.user.displayName} {attendee.userId === currentUser.id && <span className="text-zinc-500 ml-1">(You)</span>}</p>
                              <p className="text-xs text-zinc-600">{attendee.user.email}</p>
                            </div>
                          </div>
                          <Badge variant={attendee.status === "checked_in" ? "success" : attendee.status === "cancelled" ? "danger" : "neutral"}>
                            {attendee.status === "checked_in" ? "Checked In" : attendee.status === "cancelled" ? "Cancelled" : "Registered"}
                          </Badge>
                        </div>
                      ))}
                      {attendees.length > 5 && <Link href={`/dashboard/events/${eventId}/check-in`} className="block text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2">View all {attendees.length} attendees</Link>}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Calendar className="h-4 w-4 text-zinc-400" /></div>
                    <div>
                      <p className="text-sm text-zinc-200">{formatFullDate(event.startDate)}</p>
                      <p className="text-xs text-zinc-500">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5"><Clock className="h-4 w-4 text-zinc-400" /></div>
                    <div>
                      <p className="text-sm text-zinc-200">Duration</p>
                      <p className="text-xs text-zinc-500">{getDuration(event.startDate, event.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">{event.isVirtual ? <Video className="h-4 w-4 text-zinc-400" /> : <MapPin className="h-4 w-4 text-zinc-400" />}</div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200">{event.isVirtual ? "Virtual Event" : "Location"}</p>
                      {event.isVirtual ? (event.virtualLink && <a href={event.virtualLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-1">Join Meeting <ExternalLink className="h-3 w-3" /></a>) : (<p className="text-xs text-zinc-500">{event.location}</p>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card><CardContent className="p-4"><Button variant="secondary" className="w-full" onClick={handleShare}><Share2 className="h-4 w-4 mr-2" /> Share Event</Button></CardContent></Card>
          </div>
        </div>
      </div>

      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Event?" description="This action cannot be undone." confirmText="Delete Event" cancelText="Cancel" variant="danger" isLoading={isDeleting} />
      <ConfirmationModal isOpen={showCancelRegistrationModal} onClose={() => setShowCancelRegistrationModal(false)} onConfirm={handleCancelRegistration} title="Cancel Registration?" description="Are you sure you want to cancel?" confirmText="Cancel Registration" cancelText="Go Back" variant="warning" isLoading={isCancelling} />
    </>
  );
}