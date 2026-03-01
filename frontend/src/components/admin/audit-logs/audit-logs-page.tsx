"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Monitor,
  Shield,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Activity,
  Users,
  CalendarDays,
  ListTodo,
  Settings,
  Lock,
  X,
  ArrowUpRight,
  Eye,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import {
  AuditLogEntry,
  AuditLogFilters,
  AuditCategory,
  AuditSeverity,
} from "@/types/audit-log.types";
import {
  getCategoryInfo,
  getSeverityInfo,
  getResultInfo,
  calculateAuditStats,
} from "@/lib/mock-audit-logs";
import { auditLogsService } from "@/services/audit-logs.service";
import { cn } from "@/lib/utils";

const categoryIcons: Record<AuditCategory, React.ElementType> = {
  authentication: Lock,
  user_management: Users,
  event_management: CalendarDays,
  task_management: ListTodo,
  member_management: User,
  system: Settings,
  security: Shield,
};

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

function formatTimestamp(timestamp: string): { date: string; time: string; relative: string } {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relative = "";
  if (diffMins < 1) relative = "Just now";
  else if (diffMins < 60) relative = `${diffMins}m ago`;
  else if (diffHours < 24) relative = `${diffHours}h ago`;
  else if (diffDays < 7) relative = `${diffDays}d ago`;
  else relative = date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });

  return {
    date: date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    relative,
  };
}

function groupLogsByDate(logs: AuditLogEntry[]): Record<string, AuditLogEntry[]> {
  const groups: Record<string, AuditLogEntry[]> = {};
  logs.forEach((log) => {
    const date = new Date(log.timestamp).toLocaleDateString("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });
  return groups;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await auditLogsService.getLogs({
        category: filters.category !== "all" ? filters.category : undefined,
        severity: filters.severity !== "all" ? filters.severity : undefined,
        result: filters.result !== "all" ? filters.result : undefined,
        search: filters.search,
        pageSize: 100,
      });
      if (res.success && res.data) {
        setLogs(res.data.logs ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const stats = useMemo(() => calculateAuditStats(logs), [logs]);

  // Client-side actor filter (not sent to server since we fetch all)
  const filteredLogs = useMemo(() => {
    if (!filters.actorId) return logs;
    return logs.filter((log) => log.actorId === filters.actorId);
  }, [logs, filters.actorId]);

  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs), [filteredLogs]);

  const hasActiveFilters =
    !!filters.search ||
    (!!filters.category && filters.category !== "all") ||
    (!!filters.severity && filters.severity !== "all") ||
    (!!filters.result && filters.result !== "all") ||
    !!filters.actorId;

  const clearFilters = () => setFilters({});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-500" />
          <p className="text-zinc-500 text-sm">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-screen-2xl mx-auto p-4 md:p-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-1">
                  Audit Logs
                </h1>
                <p className="text-sm text-zinc-500">
                  Complete history of all system activity and admin actions.
                  {total > 0 && (
                    <span className="ml-2 text-zinc-400 font-medium">{total} total events</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="rounded-xl"
                  onClick={fetchLogs}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  Refresh
                </Button>
                <Button variant="secondary" className="rounded-xl">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-3 mb-8">
            <StatPill icon={Activity} label="Total Events" value={stats.totalEvents} color="violet" />
            <StatPill icon={Clock} label="Today" value={stats.todayEvents} color="blue" />
            <StatPill icon={AlertTriangle} label="Critical" value={stats.criticalEvents} color="red" />
            <StatPill icon={XCircle} label="Failed" value={stats.failedEvents} color="amber" />
            <StatPill icon={CheckCircle} label="Success" value={stats.totalEvents - stats.failedEvents} color="emerald" />
          </div>

          <div className="flex flex-col xl:flex-row gap-8">

            {/* Main Content */}
            <div className="flex-1 min-w-0">

              {/* Search + Filters Bar */}
              <div className="mb-6">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="Search actions, users, descriptions, IP addresses..."
                      value={filters.search || ""}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                      className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className={cn("rounded-xl", showFilters && "bg-white/10 border-white/20")}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 w-2 h-2 bg-violet-400 rounded-full" />
                    )}
                  </Button>
                </div>

                {/* Category Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <CategoryChip
                    label="All"
                    count={stats.totalEvents}
                    active={!filters.category || filters.category === "all"}
                    onClick={() => setFilters({ ...filters, category: "all" })}
                  />
                  {stats.categoryBreakdown.map(({ category, count }) => {
                    const info = getCategoryInfo(category);
                    const Icon = categoryIcons[category];
                    return (
                      <CategoryChip
                        key={category}
                        label={info.label}
                        count={count}
                        icon={Icon}
                        color={info.color}
                        active={filters.category === category}
                        onClick={() =>
                          setFilters({
                            ...filters,
                            category: filters.category === category ? "all" : category,
                          })
                        }
                      />
                    );
                  })}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FilterSelect
                        label="Severity"
                        value={filters.severity || "all"}
                        onChange={(value) =>
                          setFilters({ ...filters, severity: value as AuditSeverity | "all" })
                        }
                        options={[
                          { value: "all", label: "All Severities" },
                          { value: "info", label: "Info" },
                          { value: "warning", label: "Warning" },
                          { value: "critical", label: "Critical" },
                        ]}
                      />
                      <FilterSelect
                        label="Result"
                        value={filters.result || "all"}
                        onChange={(value) => setFilters({ ...filters, result: value as any })}
                        options={[
                          { value: "all", label: "All Results" },
                          { value: "success", label: "Success" },
                          { value: "failure", label: "Failed" },
                          { value: "partial", label: "Partial" },
                        ]}
                      />
                      <div className="flex items-end">
                        <button
                          onClick={clearFilters}
                          disabled={!hasActiveFilters}
                          className="text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results count */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-zinc-500">
                    Showing{" "}
                    <span className="text-zinc-300 font-medium">{filteredLogs.length}</span> events
                    {filters.actorId && (
                      <button
                        onClick={() => setFilters({ ...filters, actorId: undefined })}
                        className="ml-2 text-violet-400 hover:text-violet-300"
                      >
                        (clear actor filter ×)
                      </button>
                    )}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {filteredLogs.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-2xl">
                  <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-200 mb-2">No logs found</h3>
                  <p className="text-sm text-zinc-500">
                    {hasActiveFilters
                      ? "Try adjusting your filters"
                      : "Audit logs will appear here as actions are performed"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm text-violet-400 hover:text-violet-300"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedLogs).map(([date, dateLogs]) => (
                    <div key={date}>
                      <div className="sticky top-0 z-10 flex items-center gap-4 mb-4 py-2 bg-black/80 backdrop-blur-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 rounded-full border border-white/5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="text-xs font-medium text-zinc-400">{date}</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                        <span className="text-xs text-zinc-600">{dateLogs.length} events</span>
                      </div>
                      <div className="relative pl-6 border-l border-white/5 space-y-4 ml-3">
                        {dateLogs.map((log) => (
                          <LogEntry
                            key={log.id}
                            log={log}
                            isExpanded={expandedLogId === log.id}
                            onToggle={() =>
                              setExpandedLogId(expandedLogId === log.id ? null : log.id)
                            }
                            onViewDetails={() => setSelectedLog(log)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:w-80 space-y-6">

              {/* Quick Filters */}
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-medium text-zinc-300 mb-4">Quick Filters</h3>
                <div className="space-y-2">
                  <QuickFilterButton
                    label="Critical Events"
                    icon={AlertTriangle}
                    count={stats.criticalEvents}
                    color="red"
                    active={filters.severity === "critical"}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        severity: filters.severity === "critical" ? "all" : "critical",
                      })
                    }
                  />
                  <QuickFilterButton
                    label="Failed Actions"
                    icon={XCircle}
                    count={stats.failedEvents}
                    color="amber"
                    active={filters.result === "failure"}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        result: filters.result === "failure" ? "all" : "failure",
                      })
                    }
                  />
                  <QuickFilterButton
                    label="Security Events"
                    icon={Shield}
                    count={
                      stats.categoryBreakdown.find((c) => c.category === "security")?.count || 0
                    }
                    color="violet"
                    active={filters.category === "security"}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        category: filters.category === "security" ? "all" : "security",
                      })
                    }
                  />
                  <QuickFilterButton
                    label="Auth Events"
                    icon={Lock}
                    count={
                      stats.categoryBreakdown.find((c) => c.category === "authentication")?.count ||
                      0
                    }
                    color="blue"
                    active={filters.category === "authentication"}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        category: filters.category === "authentication" ? "all" : "authentication",
                      })
                    }
                  />
                </div>
              </div>

              {/* Top Actors */}
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-500" />
                  Most Active Users
                </h3>
                {stats.topActors.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-4">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topActors.slice(0, 5).map(
                      (actor: { id: string; name: string; count: number }, index: number) => (
                        <button
                          key={actor.id}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              actorId: filters.actorId === actor.id ? undefined : actor.id,
                            })
                          }
                          className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                            filters.actorId === actor.id
                              ? "bg-violet-500/10 border border-violet-500/20"
                              : "hover:bg-white/5"
                          )}
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-300 truncate">{actor.name}</p>
                          </div>
                          <span className="text-xs text-zinc-500 flex-shrink-0">
                            {actor.count}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-5">
                <h3 className="text-sm font-medium text-zinc-300 mb-4">Severity Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-xs text-zinc-400">Info — Regular activities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs text-zinc-400">Warning — Requires attention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-zinc-400">Critical — Security events</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Event Details" size="lg">
        {selectedLog && <LogDetailsContent log={selectedLog} />}
      </Modal>
    </>
  );
}

/* ============================================
   SUB-COMPONENTS
   ============================================ */

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "violet" | "blue" | "red" | "amber" | "emerald";
}) {
  const colors = {
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
    red: "from-red-500/20 to-red-500/5 border-red-500/20 text-red-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r border",
        colors[color]
      )}
    >
      <Icon className="h-4 w-4" />
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  count,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  icon?: React.ElementType;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap",
        active
          ? "bg-white text-black border-white"
          : "bg-zinc-900/50 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:border-white/10"
      )}
    >
      {Icon && <Icon className={cn("h-3.5 w-3.5", active ? "text-black" : color)} />}
      <span className="text-sm font-medium">{label}</span>
      <span
        className={cn(
          "text-xs px-1.5 py-0.5 rounded-full",
          active ? "bg-black/20 text-black" : "bg-white/10 text-zinc-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function QuickFilterButton({
  label,
  icon: Icon,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  count: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
        active ? colors[color] : "bg-white/5 border-white/5 hover:bg-white/10"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", active ? colors[color].split(" ")[0] : "text-zinc-500")} />
        <span className={cn("text-sm", active ? "text-white" : "text-zinc-400")}>{label}</span>
      </div>
      <span className={cn("text-sm font-medium", active ? "text-white" : "text-zinc-500")}>
        {count}
      </span>
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function LogEntry({
  log,
  isExpanded,
  onToggle,
  onViewDetails,
}: {
  log: AuditLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}) {
  const categoryInfo = getCategoryInfo(log.category);
  const severityInfo = getSeverityInfo(log.severity);
  const resultInfo = getResultInfo(log.result);
  const timestamp = formatTimestamp(log.timestamp);
  const CategoryIcon = categoryIcons[log.category];

  return (
    <div className="relative group">
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute -left-[25px] top-3 w-3 h-3 rounded-full border-2 bg-black",
          log.severity === "critical"
            ? "border-red-400"
            : log.severity === "warning"
            ? "border-amber-400"
            : "border-zinc-600"
        )}
      />

      <div
        className={cn(
          "bg-zinc-900/30 rounded-xl border overflow-hidden transition-all",
          log.severity === "critical"
            ? "border-red-500/20 hover:border-red-500/40"
            : log.severity === "warning"
            ? "border-amber-500/10 hover:border-amber-500/30"
            : "border-white/5 hover:border-white/10"
        )}
      >
        {/* Main row */}
        <button className="w-full text-left p-4" onClick={onToggle}>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border",
                categoryInfo.bgColor,
                categoryInfo.borderColor
              )}
            >
              <CategoryIcon className={cn("h-4 w-4", categoryInfo.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-zinc-100">{log.action}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-medium rounded border",
                    resultInfo.bgColor,
                    resultInfo.color,
                    "border-current/20"
                  )}
                >
                  {resultInfo.label}
                </span>
                {log.severity !== "info" && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-medium rounded border",
                      severityInfo.bgColor,
                      severityInfo.color,
                      "border-current/20"
                    )}
                  >
                    {severityInfo.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{log.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {log.actorName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timestamp.relative}
                </span>
                {log.ipAddress && (
                  <span className="flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    {log.ipAddress}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-all"
                title="View details"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-600 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          </div>
        </button>

        {/* Expanded details */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 border-t border-white/5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <InfoItem icon={User} label="Actor" value={log.actorName} />
              <InfoItem icon={Clock} label="Time" value={`${timestamp.date} ${timestamp.time}`} />
              {log.targetName && (
                <InfoItem icon={ArrowUpRight} label="Target" value={log.targetName} />
              )}
              {log.location && (
                <InfoItem icon={MapPin} label="Location" value={log.location} />
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="secondary"
                className="text-xs py-1.5 h-auto"
                onClick={onViewDetails}
              >
                <ExternalLink className="h-3 w-3 mr-1.5" />
                Full Details
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-zinc-600 mt-0.5" />
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
        <p className={cn("text-sm", valueColor || "text-zinc-300")}>{value}</p>
      </div>
    </div>
  );
}

function LogDetailsContent({ log }: { log: AuditLogEntry }) {
  const categoryInfo = getCategoryInfo(log.category);
  const severityInfo = getSeverityInfo(log.severity);
  const resultInfo = getResultInfo(log.result);
  const timestamp = formatTimestamp(log.timestamp);
  const CategoryIcon = categoryIcons[log.category];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border",
            categoryInfo.bgColor,
            categoryInfo.borderColor
          )}
        >
          <CategoryIcon className={cn("h-7 w-7", categoryInfo.color)} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{log.action}</h3>
          <p className="text-sm text-zinc-400 mt-1">{log.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-lg border",
                categoryInfo.bgColor,
                categoryInfo.borderColor,
                categoryInfo.color
              )}
            >
              {categoryInfo.label}
            </span>
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-lg border",
                severityInfo.bgColor,
                severityInfo.color,
                "border-current/20"
              )}
            >
              {severityInfo.label}
            </span>
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-lg border",
                resultInfo.bgColor,
                resultInfo.color,
                "border-current/20"
              )}
            >
              {resultInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Actor & Target */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Actor</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-sm font-bold text-white border border-white/10">
              {log.actorInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{log.actorName}</p>
              <p className="text-xs text-zinc-500">{log.actorEmail}</p>
              <p className="text-xs text-zinc-600 capitalize">{log.actorRole}</p>
            </div>
          </div>
        </div>

        {log.targetName ? (
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Target</p>
            <div>
              <p className="text-sm font-medium text-zinc-200">{log.targetName}</p>
              {log.targetType && (
                <p className="text-xs text-zinc-500 capitalize mt-0.5">{log.targetType}</p>
              )}
              {log.targetId && (
                <p className="text-xs text-zinc-600 font-mono mt-1 truncate">{log.targetId}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Timestamp</p>
            <p className="text-sm text-zinc-200">{timestamp.date}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{timestamp.time}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{timestamp.relative}</p>
          </div>
        )}
      </div>

      {/* Changes */}
      {log.changes && log.changes.length > 0 && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Changes</p>
          <div className="space-y-3">
            {log.changes.map((change, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <p className="text-xs text-zinc-500 font-mono">{change.field}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-400/70 line-through">{change.oldValue}</span>
                  <ArrowUpRight className="h-4 w-4 text-zinc-600" />
                  <span className="text-sm text-emerald-400 font-medium">{change.newValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Additional Metadata</p>
          <div className="space-y-2">
            {Object.entries(log.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-zinc-500">{key}</span>
                <span className="text-sm text-zinc-200 font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Request Context</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">IP Address</span>
            <span className="text-zinc-300 font-mono">{log.ipAddress}</span>
          </div>
          {log.location && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Location</span>
              <span className="text-zinc-300">{log.location}</span>
            </div>
          )}
          {log.userAgent && (
            <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
              <span className="text-zinc-500 text-xs">User Agent</span>
              <span className="text-zinc-400 text-xs font-mono break-all">{log.userAgent}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session & Log ID */}
      {log.sessionId && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Session</p>
          <div className="flex items-center justify-between">
            <code className="text-xs text-zinc-400 font-mono">{log.sessionId}</code>
            <button
              onClick={() => copyToClipboard(log.sessionId!)}
              className="p-1.5 text-zinc-600 hover:text-zinc-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600">Log ID:</span>
          <code className="text-xs text-zinc-400 font-mono bg-white/5 px-2 py-1 rounded">{log.id}</code>
        </div>
        <button
          onClick={() => copyToClipboard(log.id)}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        >
          <Copy className="h-3 w-3" />
          Copy ID
        </button>
      </div>
    </div>
  );
}