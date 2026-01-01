"use client";

import { useState, useMemo } from "react";
import { mockAdminEventApprovals, mockAdminEventAttendees } from "@/lib/mock-event-approvals";
import { Event, EventAttendee } from "@/types/event.types";
import { EventApprovalsStats } from "./event-approvals-stats";
import { EventApprovalsFilters } from "./event-approvals-filters";
import { EventApprovalsList } from "./event-approvals-list";
import { EventApprovalsDetails } from "./event-approvals-details";

export default function EventApprovalsPage() {
  const [events, setEvents] = useState<Event[]>(mockAdminEventApprovals);
  const [attendees, setAttendees] = useState<EventAttendee[]>(mockAdminEventAttendees);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Stats calculation
  const stats = useMemo(() => {
    const total = events.length;
    const pending = events.filter((e) => e.status === "pending_approval").length;
    const approved = events.filter((e) => e.status === "approved").length;
    const rejected = events.filter((e) => e.status === "rejected").length;
    const totalAttendees = attendees.length;
    return { total, pending, approved, rejected, totalAttendees };
  }, [events, attendees]);

  // Filtering logic
  const filteredEvents = useMemo(() => {
    let result = events.filter((event) => {
      if (filterStatus !== "all" && event.status !== filterStatus) return false;
      if (filterCategory !== "all" && event.category !== filterCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.createdByUser.displayName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "startDate") {
      result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }
    return result;
  }, [events, filterStatus, filterCategory, searchQuery, sortBy]);

  // Get attendees for selected event
  const selectedEventAttendees = useMemo(() => {
    if (!selectedEvent) return [];
    return attendees.filter((a) => a.eventId === selectedEvent.id);
  }, [selectedEvent, attendees]);

  // Approve event
  const handleApprove = async (id: string) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "approved" as const,
              approvedBy: "Admin User",
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
    if (selectedEvent?.id === id) {
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              status: "approved" as const,
              approvedBy: "Admin User",
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }
  };

  // Reject event
  const handleReject = async (id: string, reason: string) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "rejected" as const,
              rejectionReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
    if (selectedEvent?.id === id) {
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              status: "rejected" as const,
              rejectionReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }
  };

  // Add attendee
  const handleAddAttendee = async (
    eventId: string,
    attendeeData: Omit<EventAttendee, "id" | "eventId" | "registeredAt">
  ) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newAttendee: EventAttendee = {
      id: `att_${Date.now()}`,
      eventId,
      registeredAt: new Date().toISOString(),
      ...attendeeData,
    };
    setAttendees((prev) => [...prev, newAttendee]);
    // Update event attendee count
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, currentAttendees: e.currentAttendees + 1 } : e
      )
    );
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) =>
        prev ? { ...prev, currentAttendees: prev.currentAttendees + 1 } : null
      );
    }
  };

  // Remove attendee
  const handleRemoveAttendee = async (attendeeId: string) => {
    const attendee = attendees.find((a) => a.id === attendeeId);
    if (!attendee) return;
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
    // Update event attendee count
    setEvents((prev) =>
      prev.map((e) =>
        e.id === attendee.eventId
          ? { ...e, currentAttendees: Math.max(0, e.currentAttendees - 1) }
          : e
      )
    );
    if (selectedEvent?.id === attendee.eventId) {
      setSelectedEvent((prev) =>
        prev ? { ...prev, currentAttendees: Math.max(0, prev.currentAttendees - 1) } : null
      );
    }
  };

  // Update attendee status
  const handleUpdateAttendeeStatus = async (
    attendeeId: string,
    status: EventAttendee["status"]
  ) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? {
              ...a,
              status,
              checkedInAt: status === "checked_in" ? new Date().toISOString() : a.checkedInAt,
              checkedInBy: status === "checked_in" ? "Admin User" : a.checkedInBy,
            }
          : a
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Event Approvals
          </h1>
          <p className="text-sm text-zinc-500">
            Review, approve, or reject event submissions. Manage attendees for approved events.
          </p>
        </div>
        <EventApprovalsStats stats={stats} />
        <EventApprovalsFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventApprovalsList
            events={filteredEvents}
            onSelect={setSelectedEvent}
            onApprove={handleApprove}
            onReject={handleReject}
            selectedId={selectedEvent?.id}
          />
          <EventApprovalsDetails
            event={selectedEvent}
            attendees={selectedEventAttendees}
            onApprove={handleApprove}
            onReject={handleReject}
            onAddAttendee={handleAddAttendee}
            onRemoveAttendee={handleRemoveAttendee}
            onUpdateAttendeeStatus={handleUpdateAttendeeStatus}
          />
        </div>
      </div>
    </div>
  );
}