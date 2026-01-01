/**
 * Audit Log Types
 * Comprehensive logging for all admin actions
 */

/**
 * Action categories
 */
export type AuditCategory =
  | "authentication"
  | "user_management"
  | "event_management"
  | "task_management"
  | "member_management"
  | "system"
  | "security";

/**
 * Action severity/importance
 */
export type AuditSeverity = "info" | "warning" | "critical";

/**
 * Action result
 */
export type AuditResult = "success" | "failure" | "partial";

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  // Actor
  actorId: string;
  actorName:  string;
  actorEmail: string;
  actorRole: string;
  actorInitials:  string;
  // Action
  action:  string;
  actionCode: string;
  category: AuditCategory;
  severity:  AuditSeverity;
  result: AuditResult;
  // Target
  targetType?:  string;
  targetId?: string;
  targetName?: string;
  // Details
  description:  string;
  metadata?: Record<string, any>;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  // Context
  ipAddress:  string;
  userAgent?:  string;
  location?: string;
  sessionId?: string;
}

/**
 * Audit log filters
 */
export interface AuditLogFilters {
  search?:  string;
  category?: AuditCategory | "all";
  severity?:  AuditSeverity | "all";
  result?: AuditResult | "all";
  actorId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  actionCode?: string;
}

/**
 * Audit stats
 */
export interface AuditStats {
  totalEvents: number;
  todayEvents: number;
  criticalEvents: number;
  failedEvents: number;
  topActors: { id: string; name:  string; count: number }[];
  categoryBreakdown: { category: AuditCategory; count: number }[];
}