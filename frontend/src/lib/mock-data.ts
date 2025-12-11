import { Event, EventAttendee } from "@/types/event.types";

/**
 * Mock events data
 * This will be replaced with API calls to your C# backend
 */
export const mockEvents: Event[] = [
  {
    id: "evt_1",
    title: "Team Building Workshop",
    description: "Join us for an exciting team building workshop where we'll engage in collaborative activities designed to strengthen our bonds and improve communication. This hands-on session will include problem-solving challenges, creative exercises, and group discussions.",
    category: "workshop",
    startDate: "2024-12-15T14:00:00Z",
    endDate: "2024-12-15T17:00:00Z",
    location: "Conference Room A, Building 1",
    isVirtual: false,
    status: "approved",
    visibility: "members_only",
    maxAttendees: 30,
    currentAttendees: 24,
    requiresRegistration: true,
    createdBy: "user_1",
    createdByUser: {
      id: "user_1",
      displayName: "John Smith",
      initials: "JS",
    },
    approvedBy: "admin_1",
    approvedAt: "2024-12-01T10:00:00Z",
    createdAt: "2024-11-28T09:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "evt_2",
    title: "Monthly Community Meetup",
    description: "Our regular monthly meetup where community members can network, share updates, and discuss upcoming initiatives. Light refreshments will be provided.",
    category: "social",
    startDate: "2024-12-20T18:00:00Z",
    endDate: "2024-12-20T20:00:00Z",
    location: "Main Hall",
    isVirtual: false,
    status: "approved",
    visibility: "public",
    maxAttendees: 100,
    currentAttendees: 45,
    requiresRegistration: true,
    createdBy: "user_2",
    createdByUser: {
      id: "user_2",
      displayName: "Sarah Johnson",
      initials: "SJ",
    },
    approvedBy: "admin_1",
    approvedAt: "2024-12-05T14:00:00Z",
    createdAt: "2024-12-01T11:00:00Z",
    updatedAt: "2024-12-05T14:00:00Z",
  },
  {
    id: "evt_3",
    title: "Year-End Celebration",
    description: "Celebrate the end of an amazing year with your fellow community members! Join us for an evening of music, food, awards, and fun. Dress code: Smart casual.",
    category: "social",
    startDate: "2024-12-28T19:00:00Z",
    endDate: "2024-12-28T23:00:00Z",
    location: "Grand Ballroom, City Hotel",
    isVirtual: false,
    status: "approved",
    visibility: "members_only",
    maxAttendees: 200,
    currentAttendees: 89,
    requiresRegistration: true,
    createdBy: "user_1",
    createdByUser: {
      id: "user_1",
      displayName: "John Smith",
      initials: "JS",
    },
    approvedBy: "admin_1",
    approvedAt: "2024-12-10T09:00:00Z",
    createdAt: "2024-12-08T16:00:00Z",
    updatedAt: "2024-12-10T09:00:00Z",
  },
  {
    id: "evt_4",
    title: "Web Development Training",
    description: "A comprehensive training session on modern web development practices. Topics include React, Next.js, TypeScript, and best practices for building scalable applications.",
    category: "training",
    startDate: "2025-01-10T09:00:00Z",
    endDate: "2025-01-10T17:00:00Z",
    virtualLink: "https://zoom.us/j/123456789",
    isVirtual: true,
    status: "pending_approval",
    visibility: "members_only",
    maxAttendees: 50,
    currentAttendees: 0,
    requiresRegistration: true,
    createdBy: "user_3",
    createdByUser: {
      id: "user_3",
      displayName: "Mike Wilson",
      initials: "MW",
    },
    createdAt: "2024-12-09T10:00:00Z",
    updatedAt: "2024-12-09T10:00:00Z",
  },
  {
    id: "evt_5",
    title: "Leadership Summit",
    description: "Annual leadership summit bringing together team leads and managers. Featuring keynote speakers, breakout sessions, and strategic planning workshops.",
    category: "conference",
    startDate: "2025-01-15T08:00:00Z",
    endDate: "2025-01-15T18:00:00Z",
    location: "Executive Center",
    isVirtual: false,
    status: "draft",
    visibility: "invite_only",
    maxAttendees: 40,
    currentAttendees: 0,
    requiresRegistration: true,
    createdBy: "user_1",
    createdByUser: {
      id: "user_1",
      displayName: "John Smith",
      initials: "JS",
    },
    createdAt: "2024-12-10T08:00:00Z",
    updatedAt: "2024-12-10T08:00:00Z",
  },
  {
    id: "evt_6",
    title: "Project Kickoff Meeting",
    description: "Kickoff meeting for the new Q1 initiative. We'll discuss project goals, timeline, team assignments, and success metrics.",
    category: "meeting",
    startDate: "2025-01-05T10:00:00Z",
    endDate: "2025-01-05T11:30:00Z",
    virtualLink: "https://teams.microsoft.com/l/meetup-join/123",
    isVirtual: true,
    status: "pending_approval",
    visibility: "members_only",
    currentAttendees: 0,
    requiresRegistration: false,
    createdBy: "user_2",
    createdByUser: {
      id: "user_2",
      displayName: "Sarah Johnson",
      initials: "SJ",
    },
    createdAt: "2024-12-11T14:00:00Z",
    updatedAt: "2024-12-11T14:00:00Z",
  },
];

/**
 * Mock attendees
 */
export const mockAttendees: EventAttendee[] = [
  {
    id: "att_1",
    eventId: "evt_1",
    userId: "user_4",
    user: {
      id: "user_4",
      displayName: "Emily Davis",
      email: "emily@example.com",
      initials: "ED",
    },
    status: "registered",
    registeredAt: "2024-12-02T10:00:00Z",
  },
  {
    id: "att_2",
    eventId: "evt_1",
    userId: "user_5",
    user: {
      id: "user_5",
      displayName: "David Brown",
      email: "david@example.com",
      initials: "DB",
    },
    status: "checked_in",
    registeredAt: "2024-12-02T11:00:00Z",
    checkedInAt: "2024-12-15T13:55:00Z",
    checkedInBy: "user_1",
  },
  {
    id: "att_3",
    eventId: "evt_1",
    userId: "user_6",
    user: {
      id: "user_6",
      displayName: "Lisa Anderson",
      email: "lisa@example.com",
      initials: "LA",
    },
    status: "registered",
    registeredAt: "2024-12-03T09:00:00Z",
  },
];

/**
 * Get status badge variant
 */
export function getEventStatusBadge(status: Event["status"]): {
  variant: "success" | "warning" | "danger" | "info" | "neutral";
  label: string;
} {
  const statusConfig = {
    draft: { variant: "neutral" as const, label: "Draft" },
    pending_approval: { variant: "warning" as const, label: "Pending Approval" },
    approved: { variant: "success" as const, label: "Approved" },
    rejected: { variant: "danger" as const, label: "Rejected" },
    cancelled: { variant: "neutral" as const, label: "Cancelled" },
    completed: { variant: "info" as const, label: "Completed" },
  };

  return statusConfig[status];
}

/**
 * Get category badge
 */
export function getEventCategoryBadge(category: Event["category"]): {
  variant: "info" | "success" | "warning" | "neutral";
  label: string;
} {
  const categoryConfig = {
    meeting: { variant: "info" as const, label: "Meeting" },
    workshop: { variant: "success" as const, label: "Workshop" },
    social: { variant: "warning" as const, label: "Social" },
    training: { variant: "info" as const, label: "Training" },
    conference: { variant: "success" as const, label: "Conference" },
    other: { variant: "neutral" as const, label: "Other" },
  };

  return categoryConfig[category];
}