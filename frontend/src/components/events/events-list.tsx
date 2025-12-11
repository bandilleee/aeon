"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Video,
  Users,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import { Button, Badge, Card, CardContent, Select } from "@/components/ui";
import { mockEvents, getEventStatusBadge, getEventCategoryBadge } from "@/lib/mock-data";
import { Event, EventStatus, EventCategory } from "@/types/event.types";
import { cn } from "@/lib/utils";

/**
 * Status filter options
 */
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

/**
 * Category filter options
 */
const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "meeting", label: "Meeting" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "training", label: "Training" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Other" },
];

/**
 * Format date for display
 */
function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format time for display
 */
function formatEventTime(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const timeFormat: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return `${start.toLocaleTimeString("en-US", timeFormat)} - ${end.toLocaleTimeString("en-US", timeFormat)}`;
}

/**
 * Event Card Component
 */
function EventCard({ event }: { event: Event }) {
  const statusBadge = getEventStatusBadge(event.status);
  const categoryBadge = getEventCategoryBadge(event.category);

  return (
    <Link href={`/dashboard/events/${event.id}`}>
      <Card variant="hover" className="group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Date Box */}
            <div className="shrink-0 w-14 h-14 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center">
              <span className="text-xs text-zinc-500 uppercase">
                {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
              </span>
              <span className="text-xl font-semibold text-zinc-200">
                {new Date(event.startDate).getDate()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <Badge variant={categoryBadge.variant}>{categoryBadge.label}</Badge>
                {event.isVirtual && (
                  <Badge variant="info">
                    <Video className="h-3 w-3 mr-1" />
                    Virtual
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
                {event.title}
              </h3>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatEventTime(event.startDate, event.endDate)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{event.location}</span>
                  </div>
                )}

                {event.maxAttendees && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {event.currentAttendees}/{event.maxAttendees}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="h-8 w-8 text-zinc-600" />
      </div>
      <h3 className="text-lg font-medium text-zinc-200 mb-2">
        {hasFilters ? "No events found" : "No events yet"}
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
        {hasFilters
          ? "Try adjusting your filters to find what you're looking for."
          : "Create your first event to get started."}
      </p>
      {!hasFilters && (
        <Link href="/dashboard/events/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      )}
    </div>
  );
}

/**
 * Events List Component
 */
export function EventsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && event.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && event.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: Event[] } = {};

    filteredEvents.forEach((event) => {
      const dateKey = formatEventDate(event.startDate);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  }, [filteredEvents]);

  const hasFilters = Boolean(searchQuery || statusFilter !== "all" || categoryFilter !== "all");
  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Events
          </h1>
          <p className="text-sm text-zinc-500">
            Create and manage events for your community.
          </p>
        </div>
        <Link href="/dashboard/events/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "bg-white/10")}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 w-5 h-5 bg-white text-black text-xs font-medium rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Status Filter */}
              <Select
                label="Status"
                placeholder="Select status"
                options={statusOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              />

              {/* Category Filter */}
              <Select
                label="Category"
                placeholder="Select category"
                options={categoryOptions}
                value={categoryFilter}
                onChange={(value) => setCategoryFilter(value)}
              />

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-zinc-500"
                  disabled={!hasFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
        </p>
        
        {/* Active filters pills */}
        {hasFilters && (
          <div className="flex items-center gap-2">
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
              >
                {statusOptions.find((s) => s.value === statusFilter)?.label}
                <X className="h-3 w-3" />
              </button>
            )}
            {categoryFilter !== "all" && (
              <button
                onClick={() => setCategoryFilter("all")}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
              >
                {categoryOptions.find((c) => c.value === categoryFilter)?.label}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date}>
              {/* Date Header */}
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                {date}
              </h3>

              {/* Events for this date */}
              <div className="space-y-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}