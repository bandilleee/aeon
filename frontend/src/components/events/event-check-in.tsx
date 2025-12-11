"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  RefreshCw,
} from "lucide-react";

import { Button, Badge, Card, CardContent, Input } from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/modal";
import { mockEvents, mockAttendees } from "@/lib/mock-data";
import { EventAttendee } from "@/types/event.types";
import { cn } from "@/lib/utils";

interface EventCheckInProps {
  eventId: string;
}

export function EventCheckIn({ eventId }: EventCheckInProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "registered" | "checked_in">("all");
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [attendees, setAttendees] = useState(
    mockAttendees.filter((a) => a.eventId === eventId)
  );

  // Find the event
  const event = useMemo(() => {
    return mockEvents.find((e) => e.id === eventId);
  }, [eventId]);

  // Filter attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          attendee.user.displayName.toLowerCase().includes(query) ||
          attendee.user.email.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && attendee.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [attendees, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = attendees.length;
    const checkedIn = attendees.filter((a) => a.status === "checked_in").length;
    const pending = attendees.filter((a) => a.status === "registered").length;
    const cancelled = attendees.filter((a) => a.status === "cancelled").length;

    return { total, checkedIn, pending, cancelled };
  }, [attendees]);

  if (!event) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-zinc-500">Event not found</p>
      </div>
    );
  }

  /**
   * Handle check-in
   */
  const handleCheckIn = async (attendee: EventAttendee) => {
    setSelectedAttendee(attendee);
    setShowCheckInModal(true);
  };

  /**
   * Confirm check-in
   */
  const confirmCheckIn = async () => {
    if (!selectedAttendee) return;

    try {
      setIsProcessing(true);

      // TODO: Replace with actual API call
      console.log("Checking in:", selectedAttendee.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === selectedAttendee.id
            ? { ...a, status: "checked_in" as const, checkedInAt: new Date().toISOString() }
            : a
        )
      );

      setShowCheckInModal(false);
      setSelectedAttendee(null);
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Quick check-in (without modal)
   */
  const quickCheckIn = async (attendee: EventAttendee) => {
    try {
      // TODO: Replace with actual API call
      console.log("Quick check-in:", attendee.id);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendee.id
            ? { ...a, status: "checked_in" as const, checkedInAt: new Date().toISOString() }
            : a
        )
      );
    } catch (error) {
      console.error("Failed to check in:", error);
    }
  };

  /**
   * Undo check-in
   */
  const undoCheckIn = async (attendee: EventAttendee) => {
    try {
      // TODO: Replace with actual API call
      console.log("Undoing check-in:", attendee.id);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendee.id
            ? { ...a, status: "registered" as const, checkedInAt: undefined }
            : a
        )
      );
    } catch (error) {
      console.error("Failed to undo check-in:", error);
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                Check-in: {event.title}
              </h1>
              <p className="text-sm text-zinc-500">
                Manage attendee check-ins for this event. 
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white/5 rounded-lg border border-white/10 mx-auto mb-2">
                <Users className="h-5 w-5 text-zinc-400" />
              </div>
              <p className="text-2xl font-semibold text-zinc-100">{stats.total}</p>
              <p className="text-xs text-zinc-500">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mx-auto mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-semibold text-emerald-500">
                {stats.checkedIn}
              </p>
              <p className="text-xs text-zinc-500">Checked In</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-500/10 rounded-lg border border-amber-500/20 mx-auto mb-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-semibold text-amber-500">
                {stats.pending}
              </p>
              <p className="text-xs text-zinc-500">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-red-500/10 rounded-lg border border-red-500/20 mx-auto mb-2">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <p className="text-2xl font-semibold text-red-400">
                {stats.cancelled}
              </p>
              <p className="text-xs text-zinc-500">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(["all", "registered", "checked_in"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  statusFilter === status
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 border border-white/5 hover:bg-zinc-800"
                )}
              >
                {status === "all"
                  ? "All"
                  : status === "registered"
                  ? "Pending"
                  : "Checked In"}
              </button>
            ))}
          </div>
        </div>

        {/* Attendees List */}
        <Card>
          <CardContent className="p-0">
            {filteredAttendees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-500">No attendees found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className={cn(
                      "flex items-center justify-between p-4 hover:bg-white/2 transition-colors",
                      attendee.status === "checked_in" && "bg-emerald-500/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border",
                          attendee.status === "checked_in"
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : "bg-linear-to-tr from-zinc-700 to-zinc-500 border-white/10 text-white"
                        )}
                      >
                        {attendee.status === "checked_in" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          attendee.user.initials
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <p className="text-sm text-zinc-200 font-medium">
                          {attendee.user.displayName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {attendee.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {attendee.status === "checked_in" ? (
                        <>
                          <span className="text-xs text-zinc-500">
                            Checked in at{" "}
                            {new Date(attendee.checkedInAt!).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => undoCheckIn(attendee)}
                            className="text-zinc-500 hover:text-zinc-300"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Undo
                          </Button>
                        </>
                      ) : attendee.status === "registered" ? (
                        <Button
                          size="sm"
                          onClick={() => quickCheckIn(attendee)}
                          leftIcon={<UserCheck className="h-4 w-4" />}
                        >
                          Check In
                        </Button>
                      ) : (
                        <Badge variant="danger">Cancelled</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Check-in Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCheckInModal}
        onClose={() => {
          setShowCheckInModal(false);
          setSelectedAttendee(null);
        }}
        onConfirm={confirmCheckIn}
        title="Confirm Check-in"
        description={`Check in ${selectedAttendee?.user.displayName} to this event? `}
        confirmText="Check In"
        cancelText="Cancel"
        isLoading={isProcessing}
      />
    </>
  );
}