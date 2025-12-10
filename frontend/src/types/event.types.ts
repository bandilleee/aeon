/**
 * Event status
 */
export type EventStatus = "draft" | "pending_approval" | "approved" | "rejected" | "cancelled" | "completed";

/**
 * Event visibility
 */
export type EventVisibility = "public" | "members_only" | "invite_only";

/**
 * Event information
 */
export interface Event {
  id: string;
  title:  string;
  description:  string;
  startDate: string;
  endDate: string;
  location?:  string;
  virtualLink?: string;
  status: EventStatus;
  visibility: EventVisibility;
  coverImageUrl?: string;
  maxAttendees?:  number;
  requiresRegistration:  boolean;
  
  // Creator information
  createdBy: string;
  createdByUser?:  {
    id: string;
    displayName: string;
    avatarUrl?:  string;
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
 * Event registration/attendee
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
  };
  status: "registered" | "checked_in" | "cancelled" | "no_show";
  registeredAt: string;
  checkedInAt?: string;
  checkedInBy?: string;
}

/**
 * Event creation form data
 */
export interface CreateEventData {
  title: string;
  description: string;
  startDate:  string;
  endDate: string;
  location?: string;
  virtualLink?:  string;
  visibility: EventVisibility;
  coverImage?: File;
  maxAttendees?: number;
  requiresRegistration: boolean;
}