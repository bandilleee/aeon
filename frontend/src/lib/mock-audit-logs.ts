import { AuditLogEntry, AuditCategory, AuditSeverity, AuditStats } from "@/types/audit-log.types";

/**
 * Mock audit log entries
 */
export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "log_001",
    timestamp:  "2025-01-01T09:45:23Z",
    actorId: "usr_001",
    actorName: "Sarah Mitchell",
    actorEmail: "sarah. admin@aeon.com",
    actorRole: "admin",
    actorInitials: "SM",
    action: "User Suspended",
    actionCode: "USER_SUSPEND",
    category:  "user_management",
    severity: "warning",
    result: "success",
    targetType: "user",
    targetId:  "usr_008",
    targetName: "Michael Johnson",
    description: "Suspended user account due to policy violation",
    metadata:  {
      reason: "Violation of community guidelines - pending investigation",
    },
    ipAddress: "102.65.123.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    location: "Johannesburg, South Africa",
    sessionId:  "sess_abc123",
  },
  {
    id: "log_002",
    timestamp: "2025-01-01T09:30:00Z",
    actorId: "usr_001",
    actorName: "Sarah Mitchell",
    actorEmail: "sarah. admin@aeon. com",
    actorRole: "admin",
    actorInitials: "SM",
    action:  "Login Successful",
    actionCode: "AUTH_LOGIN",
    category: "authentication",
    severity: "info",
    result: "success",
    description: "Administrator logged in successfully",
    ipAddress: "102.65.123.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    location: "Johannesburg, South Africa",
    sessionId: "sess_abc123",
  },
  {
    id: "log_003",
    timestamp: "2025-01-01T08:15:00Z",
    actorId: "usr_002",
    actorName: "James Van Der Berg",
    actorEmail: "james. admin@aeon. com",
    actorRole: "admin",
    actorInitials: "JV",
    action:  "Event Approved",
    actionCode: "EVENT_APPROVE",
    category: "event_management",
    severity:  "info",
    result: "success",
    targetType: "event",
    targetId:  "evt_101",
    targetName: "Team Building Workshop",
    description:  "Approved event submission for publication",
    ipAddress: "41.203.67.89",
    location: "Cape Town, South Africa",
  },
  {
    id: "log_004",
    timestamp: "2025-01-01T07:45:00Z",
    actorId: "usr_003",
    actorName: "Linda Van Rooyen",
    actorEmail: "linda. leader@aeon.com",
    actorRole: "community_leader",
    actorInitials:  "LR",
    action:  "Member Added",
    actionCode: "MEMBER_CREATE",
    category:  "member_management",
    severity: "info",
    result:  "success",
    targetType: "member",
    targetId: "mem_045",
    targetName: "John Doe",
    description:  "Added new member to the community",
    metadata: {
      memberEmail: "john.doe@example.com",
    },
    ipAddress: "196.25.45.123",
    location: "Durban, South Africa",
  },
  {
    id:  "log_005",
    timestamp: "2024-12-31T23:59:00Z",
    actorId: "system",
    actorName: "System",
    actorEmail: "system@aeon.com",
    actorRole:  "system",
    actorInitials: "SY",
    action:  "Automated Backup",
    actionCode: "SYSTEM_BACKUP",
    category: "system",
    severity:  "info",
    result: "success",
    description: "Daily automated backup completed successfully",
    metadata: {
      backupSize: "2. 4 GB",
      duration: "4m 32s",
    },
    ipAddress:  "127.0.0.1",
  },
  {
    id:  "log_006",
    timestamp: "2024-12-31T22:30:00Z",
    actorId:  "usr_009",
    actorName: "Emma Davis",
    actorEmail: "emma. locked@aeon.com",
    actorRole: "community_leader",
    actorInitials: "ED",
    action:  "Login Failed",
    actionCode: "AUTH_LOGIN_FAILED",
    category:  "authentication",
    severity: "warning",
    result: "failure",
    description: "Failed login attempt - invalid password (attempt 5/5)",
    metadata: {
      attemptNumber: 5,
      accountLocked: true,
    },
    ipAddress: "105.112.45.67",
    location: "Lagos, Nigeria",
  },
  {
    id: "log_007",
    timestamp: "2024-12-31T22:29:00Z",
    actorId:  "usr_009",
    actorName: "Emma Davis",
    actorEmail: "emma. locked@aeon. com",
    actorRole: "community_leader",
    actorInitials:  "ED",
    action: "Login Failed",
    actionCode: "AUTH_LOGIN_FAILED",
    category: "authentication",
    severity:  "warning",
    result: "failure",
    description: "Failed login attempt - invalid password (attempt 4/5)",
    metadata: {
      attemptNumber: 4,
    },
    ipAddress: "105.112.45.67",
    location: "Lagos, Nigeria",
  },
  {
    id: "log_008",
    timestamp: "2024-12-31T20:00:00Z",
    actorId:  "usr_001",
    actorName: "Sarah Mitchell",
    actorEmail: "sarah. admin@aeon. com",
    actorRole: "admin",
    actorInitials: "SM",
    action:  "Permissions Modified",
    actionCode: "USER_PERMISSIONS_UPDATE",
    category:  "security",
    severity:  "critical",
    result:  "success",
    targetType: "user",
    targetId:  "usr_005",
    targetName: "Priya Naidoo",
    description: "Modified user permissions - granted elevated access",
    changes: [
      { field: "events_approve", oldValue: "false", newValue: "true" },
    ],
    ipAddress: "102.65.123.45",
    location: "Johannesburg, South Africa",
  },
  {
    id: "log_009",
    timestamp: "2024-12-31T18:30:00Z",
    actorId:  "usr_002",
    actorName: "James Van Der Berg",
    actorEmail: "james.admin@aeon.com",
    actorRole: "admin",
    actorInitials: "JV",
    action: "Event Rejected",
    actionCode: "EVENT_REJECT",
    category: "event_management",
    severity:  "info",
    result: "success",
    targetType:  "event",
    targetId: "evt_103",
    targetName: "Volunteer Induction",
    description: "Rejected event submission",
    metadata: {
      reason: "Insufficient details provided",
    },
    ipAddress: "41.203.67.89",
    location: "Cape Town, South Africa",
  },
  {
    id: "log_010",
    timestamp: "2024-12-31T16:00:00Z",
    actorId: "usr_001",
    actorName: "Sarah Mitchell",
    actorEmail: "sarah. admin@aeon. com",
    actorRole: "admin",
    actorInitials: "SM",
    action:  "User Created",
    actionCode: "USER_CREATE",
    category:  "user_management",
    severity: "info",
    result: "success",
    targetType: "user",
    targetId: "usr_007",
    targetName: "Anele Sithole",
    description: "Created new community leader account",
    metadata:  {
      role: "community_leader",
      inviteSent: true,
    },
    ipAddress: "102.65.123.45",
    location:  "Johannesburg, South Africa",
  },
  {
    id: "log_011",
    timestamp: "2024-12-31T14:00:00Z",
    actorId: "usr_001",
    actorName: "Sarah Mitchell",
    actorEmail: "sarah. admin@aeon. com",
    actorRole: "admin",
    actorInitials: "SM",
    action:  "Role Changed",
    actionCode: "USER_ROLE_UPDATE",
    category:  "security",
    severity:  "critical",
    result: "success",
    targetType:  "user",
    targetId: "usr_006",
    targetName: "Jacob Mensah",
    description: "Changed user role",
    changes: [
      { field: "role", oldValue: "viewer", newValue: "moderator" },
    ],
    ipAddress: "102.65.123.45",
    location: "Johannesburg, South Africa",
  },
  {
    id: "log_012",
    timestamp: "2024-12-31T12:00:00Z",
    actorId: "system",
    actorName: "System",
    actorEmail: "system@aeon.com",
    actorRole:  "system",
    actorInitials:  "SY",
    action: "Security Scan",
    actionCode: "SYSTEM_SECURITY_SCAN",
    category:  "security",
    severity: "info",
    result:  "success",
    description: "Automated security scan completed - no threats detected",
    metadata: {
      scanDuration: "12m 45s",
      filesScanned: 15420,
      threatsFound: 0,
    },
    ipAddress: "127.0.0.1",
  },
  {
    id: "log_013",
    timestamp: "2024-12-30T10:00:00Z",
    actorId: "usr_004",
    actorName: "Thabo Mokoena",
    actorEmail: "thabo.leader@aeon.com",
    actorRole: "community_leader",
    actorInitials: "TM",
    action: "Task Created",
    actionCode: "TASK_CREATE",
    category: "task_management",
    severity:  "info",
    result: "success",
    targetType:  "task",
    targetId: "task_089",
    targetName: "Prepare monthly report",
    description: "Created new task and assigned collaborators",
    ipAddress: "196.25.45.123",
    location:  "Pretoria, South Africa",
  },
  {
    id:  "log_014",
    timestamp: "2024-12-30T09:00:00Z",
    actorId:  "unknown",
    actorName: "Unknown",
    actorEmail: "unknown",
    actorRole: "unknown",
    actorInitials: "?? ",
    action:  "Unauthorized Access Attempt",
    actionCode: "AUTH_UNAUTHORIZED",
    category: "security",
    severity:  "critical",
    result: "failure",
    description: "Blocked unauthorized access attempt from suspicious IP",
    metadata: {
      blockedReason: "IP blacklisted",
      attemptedEndpoint: "/api/admin/users",
    },
    ipAddress: "185.220.101.45",
    location:  "Unknown (TOR exit node)",
  },
  {
    id:  "log_015",
    timestamp: "2024-12-29T15:30:00Z",
    actorId:  "usr_002",
    actorName: "James Van Der Berg",
    actorEmail: "james.admin@aeon.com",
    actorRole:  "admin",
    actorInitials:  "JV",
    action: "System Settings Updated",
    actionCode: "SYSTEM_SETTINGS_UPDATE",
    category: "system",
    severity: "warning",
    result:  "success",
    description: "Updated system notification settings",
    changes: [
      { field: "emailNotifications", oldValue: "false", newValue: "true" },
      { field: "maintenanceMode", oldValue: "false", newValue: "false" },
    ],
    ipAddress:  "41.203.67.89",
    location: "Cape Town, South Africa",
  },
];

/**
 * Get category display info
 */
export function getCategoryInfo(category: AuditCategory): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  const config = {
    authentication: {
      label: "Authentication",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    user_management: {
      label: "User Management",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    event_management:  {
      label:  "Events",
      color:  "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    task_management: {
      label: "Tasks",
      color:  "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    member_management:  {
      label:  "Members",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    system: {
      label: "System",
      color:  "text-zinc-400",
      bgColor: "bg-zinc-500/10",
      borderColor: "border-zinc-500/20",
    },
    security: {
      label: "Security",
      color:  "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  };
  return config[category];
}

/**
 * Get severity display info
 */
export function getSeverityInfo(severity: AuditSeverity): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  const config = {
    info: {
      label: "Info",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      icon: "info",
    },
    warning: {
      label: "Warning",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      icon: "warning",
    },
    critical: {
      label: "Critical",
      color: "text-red-400",
      bgColor:  "bg-red-500/10",
      icon: "critical",
    },
  };
  return config[severity];
}

/**
 * Get result display info
 */
export function getResultInfo(result: AuditLogEntry["result"]): {
  label: string;
  color: string;
  bgColor: string;
} {
  const config = {
    success: {
      label: "Success",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    failure: {
      label: "Failed",
      color:  "text-red-400",
      bgColor: "bg-red-500/10",
    },
    partial: {
      label: "Partial",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  };
  return config[result];
}

/**
 * Calculate audit stats
 */
export function calculateAuditStats(logs: AuditLogEntry[]): AuditStats {
  const today = new Date().toDateString();
  const todayLogs = logs.filter(
    (log) => new Date(log.timestamp).toDateString() === today
  );

  const actorCounts:  Record<string, { name: string; count:  number }> = {};
  const categoryCounts: Record<AuditCategory, number> = {
    authentication: 0,
    user_management: 0,
    event_management:  0,
    task_management: 0,
    member_management: 0,
    system:  0,
    security: 0,
  };

  logs.forEach((log) => {
    if (! actorCounts[log.actorId]) {
      actorCounts[log.actorId] = { name: log.actorName, count:  0 };
    }
    actorCounts[log.actorId]. count++;
    categoryCounts[log.category]++;
  });

  const topActors = Object.entries(actorCounts)
    .map(([id, { name, count }]) => ({ id, name, count }))
    .sort((a, b) => b.count - a. count)
    .slice(0, 5);

  const categoryBreakdown = Object. entries(categoryCounts)
    .map(([category, count]) => ({ category: category as AuditCategory, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalEvents: logs.length,
    todayEvents: todayLogs.length,
    criticalEvents: logs.filter((l) => l.severity === "critical").length,
    failedEvents: logs.filter((l) => l.result === "failure").length,
    topActors,
    categoryBreakdown,
  };
}