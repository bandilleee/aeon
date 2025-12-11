/**
 * Event status
 */
export type EventStatus = 
  | "draft" 
  | "pending_approval" 
  | "approved" 
  | "rejected" 
  | "cancelled" 
  | "completed";

/**
 * Event visibility
 */
export type EventVisibility = "public" | "members_only" | "invite_only";

/**
 * Event category
 */
export type EventCategory = 
  | "meeting" 
  | "workshop" 
  | "social" 
  | "training" 
  | "conference" 
  | "other";

/**
 * Event information
 */
export interface Event {
  id:  string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location?:  string;
  virtualLink?: string;
  isVirtual: boolean;
  status:  EventStatus;
  visibility: EventVisibility;
  coverImageUrl?: string;
  maxAttendees?:  number;
  currentAttendees:  number;
  requiresRegistration: boolean;

  // Creator information
  createdBy: string;
  createdByUser: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    initials: string;
  };

  // Approval information
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Event attendee
 */
export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    initials: string;
  };
  status: "registered" | "checked_in" | "cancelled" | "no_show";
  registeredAt: string;
  checkedInAt?: string;
  checkedInBy?: string;
}

/**
 * Create event form data
 */
export interface CreateEventData {
  title:  string;
  description: string;
  category: EventCategory;
  startDate:  string;
  startTime: string;
  endDate: string;
  endTime: string;
  location?:  string;
  virtualLink?: string;
  isVirtual: boolean;
  visibility: EventVisibility;
  maxAttendees?: number;
  requiresRegistration: boolean;
}

/**
 * Event filters
 */
export interface EventFilters {
  search?: string;
  status?: EventStatus | "all";
  category?: EventCategory | "all";
  visibility?: EventVisibility | "all";
  dateRange?: "upcoming" | "past" | "all";
}