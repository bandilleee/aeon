import { Event, EventAttendee } from "@/types/event.types";
import { Task, TaskComment, TaskStatus, TaskPriority } from "@/types/task.types";

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


/**
 * Mock users for collaborators
 */
export const mockUsers = [
  {
    id: "user_1",
    displayName: "Jane Doe",
    email: "jane@example.com",
    initials: "JD",
  },
  {
    id: "user_2",
    displayName: "John Smith",
    email: "john@example.com",
    initials: "JS",
  },
  {
    id: "user_3",
    displayName: "Sarah Johnson",
    email: "sarah@example.com",
    initials: "SJ",
  },
  {
    id: "user_4",
    displayName: "Mike Wilson",
    email: "mike@example.com",
    initials: "MW",
  },
  {
    id: "user_5",
    displayName: "Emily Davis",
    email: "emily@example.com",
    initials: "ED",
  },
];

/**
 * Mock tasks data
 */
export const mockTasks: Task[] = [
  {
    id: "task_1",
    title: "Update event registration system",
    description: "Implement the new registration flow with email confirmations and QR code generation for check-in. Need to integrate with the existing event management system.",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-12-20T23:59:59Z",
    createdBy: "user_1",
    createdByUser: {
      id: "user_1",
      displayName: "Jane Doe",
      initials: "JD",
    },
    collaborators: [
      {
        id: "collab_1",
        userId: "user_2",
        user: {
          id: "user_2",
          displayName: "John Smith",
          email: "john@example.com",
          initials: "JS",
        },
        role: "assignee",
        assignedAt: "2024-12-01T10:00:00Z",
      },
      {
        id: "collab_2",
        userId: "user_3",
        user: {
          id: "user_3",
          displayName: "Sarah Johnson",
          email: "sarah@example.com",
          initials: "SJ",
        },
        role: "reviewer",
        assignedAt: "2024-12-01T10:00:00Z",
      },
    ],
    commentsCount: 5,
    createdAt: "2024-12-01T09:00:00Z",
    updatedAt: "2024-12-10T14:30:00Z",
  },
  {
    id: "task_2",
    title: "Design community newsletter template",
    description: "Create a modern, responsive email template for the monthly community newsletter. Should include sections for upcoming events, member spotlights, and announcements.",
    status: "todo",
    priority: "medium",
    dueDate: "2024-12-25T23:59:59Z",
    createdBy: "user_1",
    createdByUser: {
      id: "user_1",
      displayName: "Jane Doe",
      initials: "JD",
    },
    collaborators: [
      {
        id: "collab_3",
        userId: "user_4",
        user: {
          id: "user_4",
          displayName: "Mike Wilson",
          email: "mike@example.com",
          initials: "MW",
        },
        role: "assignee",
        assignedAt: "2024-12-05T09:00:00Z",
      },
    ],
    commentsCount: 2,
    createdAt: "2024-12-05T09:00:00Z",
    updatedAt: "2024-12-05T09:00:00Z",
  },
  {
    id: "task_3",
    title: "Review membership applications",
    description: "Go through the pending membership applications and verify the information provided. Approve or reject based on community guidelines.",
    status: "in_review",
    priority: "urgent",
    dueDate: "2024-12-15T23:59:59Z",
    createdBy: "user_2",
    createdByUser: {
      id: "user_2",
      displayName: "John Smith",
      initials: "JS",
    },
    collaborators: [
      {
        id: "collab_4",
        userId: "user_1",
        user: {
          id: "user_1",
          displayName: "Jane Doe",
          email: "jane@example.com",
          initials: "JD",
        },
        role: "reviewer",
        assignedAt: "2024-12-08T11:00:00Z",
      },
    ],
    eventId: "evt_1",
    eventTitle: "Team Building Workshop",
    commentsCount: 8,
    createdAt: "2024-12-08T11:00:00Z",
    updatedAt: "2024-12-11T16:00:00Z",
  },
  {
    id: "task_4",
    title: "Prepare year-end report",
    description: "Compile all community metrics, event attendance, membership growth, and engagement statistics for the annual report presentation.",
    status: "todo",
    priority: "high",
    dueDate: "2024-12-30T23:59:59Z",
    createdBy: "user_1",
    createdByUser: {
      id: "user_1",
      displayName: "Jane Doe",
      initials: "JD",
    },
    collaborators: [
      {
        id: "collab_5",
        userId: "user_3",
        user: {
          id: "user_3",
          displayName: "Sarah Johnson",
          email: "sarah@example.com",
          initials: "SJ",
        },
        role: "assignee",
        assignedAt: "2024-12-10T08:00:00Z",
      },
      {
        id: "collab_6",
        userId: "user_5",
        user: {
          id: "user_5",
          displayName: "Emily Davis",
          email: "emily@example.com",
          initials: "ED",
        },
        role: "assignee",
        assignedAt: "2024-12-10T08:00:00Z",
      },
    ],
    commentsCount: 0,
    createdAt: "2024-12-10T08:00:00Z",
    updatedAt: "2024-12-10T08:00:00Z",
  },
  {
    id: "task_5",
    title: "Set up social media automation",
    description: "Configure Buffer or Hootsuite for automated posting of event announcements and community updates across all social media platforms.",
    status: "completed",
    priority: "low",
    createdBy: "user_3",
    createdByUser: {
      id: "user_3",
      displayName: "Sarah Johnson",
      initials: "SJ",
    },
    collaborators: [],
    commentsCount: 3,
    createdAt: "2024-11-20T10:00:00Z",
    updatedAt: "2024-12-05T15:00:00Z",
    completedAt: "2024-12-05T15:00:00Z",
  },
  {
    id: "task_6",
    title: "Organize volunteer training session",
    description: "Plan and execute a training session for new volunteers covering event management, member engagement, and community guidelines.",
    status: "in_progress",
    priority: "medium",
    dueDate: "2024-12-18T23:59:59Z",
    createdBy: "user_2",
    createdByUser: {
      id: "user_2",
      displayName: "John Smith",
      initials: "JS",
    },
    collaborators: [
      {
        id: "collab_7",
        userId: "user_4",
        user: {
          id: "user_4",
          displayName: "Mike Wilson",
          email: "mike@example.com",
          initials: "MW",
        },
        role: "assignee",
        assignedAt: "2024-12-02T14:00:00Z",
      },
    ],
    eventId: "evt_2",
    eventTitle: "Monthly Community Meetup",
    commentsCount: 4,
    createdAt: "2024-12-02T14:00:00Z",
    updatedAt: "2024-12-09T11:00:00Z",
  },
];

/**
 * Mock task comments
 */
export const mockTaskComments: TaskComment[] = [
  {
    id: "comment_1",
    taskId: "task_1",
    userId: "user_2",
    user: {
      id: "user_2",
      displayName: "John Smith",
      initials: "JS",
    },
    content: "I've started working on the email confirmation flow. Should have a draft ready by tomorrow.",
    createdAt: "2024-12-02T10:00:00Z",
  },
  {
    id: "comment_2",
    taskId: "task_1",
    userId: "user_1",
    user: {
      id: "user_1",
      displayName: "Jane Doe",
      initials: "JD",
    },
    content: "Great! Make sure to include the event details in the confirmation email.",
    createdAt: "2024-12-02T11:30:00Z",
  },
  {
    id: "comment_3",
    taskId: "task_1",
    userId: "user_3",
    user: {
      id: "user_3",
      displayName: "Sarah Johnson",
      initials: "SJ",
    },
    content: "I'll review the QR code implementation once it's ready.",
    createdAt: "2024-12-03T09:00:00Z",
  },
];

/**
 * Get task status badge
 */
export function getTaskStatusBadge(status: TaskStatus): {
  variant: "success" | "warning" | "info" | "neutral";
  label: string;
} {
  const statusConfig = {
    todo: { variant: "neutral" as const, label: "To Do" },
    in_progress: { variant: "info" as const, label: "In Progress" },
    in_review: { variant: "warning" as const, label: "In Review" },
    completed: { variant: "success" as const, label: "Completed" },
  };

  return statusConfig[status];
}

/**
 * Get task priority badge
 */
export function getTaskPriorityBadge(priority: TaskPriority): {
  variant: "success" | "warning" | "danger" | "neutral";
  label: string;
} {
  const priorityConfig = {
    low: { variant: "neutral" as const, label: "Low" },
    medium: { variant: "success" as const, label: "Medium" },
    high: { variant: "warning" as const, label: "High" },
    urgent: { variant: "danger" as const, label: "Urgent" },
  };

  return priorityConfig[priority];
}