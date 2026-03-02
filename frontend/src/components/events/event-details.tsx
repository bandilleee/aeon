"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Clock, MapPin, Video, Users, Edit, Trash2,
  UserCheck, CheckCircle, XCircle, AlertTriangle, UserMinus, Loader2, UserPlus,
} from "lucide-react";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/modal";
import { getEventStatusBadge, getEventCategoryBadge } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Event } from "@/types/event.types";
import { eventService } from "@/services/events.service";
import { useAuth } from "@/contexts/auth-context";

interface EventDetailsProps { eventId: string; }

function formatFullDate(d: string) {
  if (!d) return "No Date";
  const s = d.endsWith("Z") ? d : `${d}Z`;
  return new Date(s).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function formatTime(d: string) {
  if (!d) return "TBD";
  const s = d.endsWith("Z") ? d : `${d}Z`;
  return new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
function getDuration(start: string, end: string) {
  if (!start || !end) return "Unknown";
  const ms = new Date(end.endsWith("Z") ? end : `${end}Z`).getTime() -
             new Date(start.endsWith("Z") ? start : `${start}Z`).getTime();
  if (ms <= 0) return "0 min";
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

export function EventDetails({ eventId }: EventDetailsProps) {
  const router  = useRouter();
  const { user } = useAuth();

  const [event,      setEvent]      = useState<any | null>(null);
  const [attendees,  setAttendees]  = useState<any[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [isRegistered,   setIsRegistered]   = useState(false);
  const [isRegistering,  setIsRegistering]  = useState(false);
  const [isCancelling,   setIsCancelling]   = useState(false);
  const [isDeleting,     setIsDeleting]     = useState(false);

  const [showDeleteModal,   setShowDeleteModal]   = useState(false);
  const [showCancelModal,   setShowCancelModal]   = useState(false);

  // ── LOAD EVENT + ATTENDEES ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [evRes, attRes] = await Promise.all([
        eventService.getEventById(eventId),
        eventService.getEventAttendees(eventId),
      ]);
      if (evRes.success && evRes.data)   setEvent(evRes.data);
      else setError(evRes.error?.message ?? "Event not found.");

      if (attRes.success && attRes.data) {
        setAttendees(attRes.data);
        // Check if current user is already registered
        const me = attRes.data.find((a: any) => a.userId === user?.id && a.status === "registered");
        setIsRegistered(!!me);
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to load event.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── REGISTER ────────────────────────────────────────────────────────
  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      const res = await eventService.registerForEvent(eventId);
      if (res.success) {
        setIsRegistered(true);
        // Refresh attendee list so other members see the new registration
        await loadData();
      } else {
        alert(res.error?.message ?? "Registration failed.");
      }
    } catch (e: any) {
      alert(e.message ?? "Registration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  // ── CANCEL REGISTRATION ─────────────────────────────────────────────
  const handleCancelRegistration = async () => {
    try {
      setIsCancelling(true);
      const res = await eventService.cancelRegistration(eventId);
      if (res.success) {
        setIsRegistered(false);
        setShowCancelModal(false);
        await loadData();
      }
    } catch (e: any) {
      alert(e.message ?? "Failed to cancel registration.");
    } finally {
      setIsCancelling(false);
    }
  };

  // ── DELETE EVENT ────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await eventService.deleteEvent(eventId);
      router.push("/events");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── GUARDS ──────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
    </div>
  );
  if (error || !event) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-zinc-400">{error ?? "Event not found."}</p>
      <Button variant="ghost" onClick={() => router.back()}>Go back</Button>
    </div>
  );

  const statusBadge   = getEventStatusBadge(event.status);
  const categoryBadge = getEventCategoryBadge(event.category);
  const isCreator     = user?.id === event.createdBy;
  const isAdmin       = user?.role === "admin";
  const canRegister   = event.status === "approved" && event.requiresRegistration && !isCreator;
  const isFull        = event.maxAttendees && event.currentAttendees >= event.maxAttendees;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">

        {/* Back */}
        <Link href="/events" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                  <Badge className={categoryBadge.className}>{categoryBadge.label}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
                <p className="text-zinc-400 text-sm leading-relaxed">{event.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {(isCreator || isAdmin) && (
                  <>
                    <Link href={`/events/${eventId}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive" size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Register / Cancel Registration */}
            {canRegister && (
              <div className="mt-6 pt-6 border-t border-white/5">
                {isRegistered ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      You&apos;re registered for this event
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setShowCancelModal(true)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Cancel Registration
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleRegister}
                    isLoading={isRegistering}
                    disabled={!!isFull}
                    leftIcon={<UserPlus className="h-4 w-4" />}
                  >
                    {isFull ? "Event Full" : "Register for Event"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-300">{formatFullDate(event.startDate)}</p>
                  <p className="text-xs text-zinc-500">{formatTime(event.startDate)} — {formatTime(event.endDate)} · {getDuration(event.startDate, event.endDate)}</p>
                </div>
              </div>

              {event.isVirtual ? (
                <div className="flex items-start gap-3">
                  <Video className="h-4 w-4 text-zinc-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-300">Virtual Event</p>
                    {event.virtualLink && isRegistered && (
                      <a href={event.virtualLink} target="_blank" rel="noreferrer"
                        className="text-xs text-blue-400 hover:underline">
                        Join Link
                      </a>
                    )}
                  </div>
                </div>
              ) : event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-zinc-500 mt-0.5" />
                  <p className="text-sm text-zinc-300">{event.location}</p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-zinc-500 mt-0.5" />
                <div>
                  <p className="text-sm text-zinc-300">
                    {event.currentAttendees} registered
                    {event.maxAttendees ? ` / ${event.maxAttendees} max` : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader>
              <CardTitle>Attendees ({attendees.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {attendees.length === 0 ? (
                <p className="text-sm text-zinc-500">No registrations yet. Be the first!</p>
              ) : (
                <div className="space-y-2">
                  {attendees.slice(0, 8).map((a: any) => {
                    const u = typeof a.user === "string" ? JSON.parse(a.user) : a.user;
                    return (
                      <div key={a.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs text-zinc-300 font-medium">
                          {u?.initials ?? "?"}
                        </div>
                        <span className="text-sm text-zinc-300">{u?.displayName ?? "Unknown"}</span>
                        {a.userId === user?.id && (
                          <span className="text-xs text-emerald-400 ml-auto">You</span>
                        )}
                      </div>
                    );
                  })}
                  {attendees.length > 8 && (
                    <p className="text-xs text-zinc-600 mt-2">+{attendees.length - 8} more</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Cancel Registration Confirmation */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelRegistration}
        title="Cancel Registration"
        message="Are you sure you want to cancel your registration for this event?"
        confirmLabel="Yes, Cancel"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}