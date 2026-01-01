"use client";

import { useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Download,
  UserX,
  UserCheck,
  Shield,
  Mail,
  ChevronDown,
} from "lucide-react";
import { Button, Select, Card, CardContent } from "@/components/ui";
import { UserFilters, UserSort, BulkAction, SystemRole, AccountStatus } from "@/types/admin-user.types";
import { cn } from "@/lib/utils";

interface FiltersProps {
  filters: UserFilters;
  setFilters: (filters:  UserFilters) => void;
  sort: UserSort;
  setSort: (sort: UserSort) => void;
  selectedCount: number;
  onBulkAction: (action: BulkAction) => void;
}

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "community_leader", label: "Community Leader" },
  { value: "moderator", label:  "Moderator" },
  { value: "viewer", label: "Viewer" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "locked", label: "Locked" },
  { value: "deactivated", label:  "Deactivated" },
];

const twoFactorOptions = [
  { value: "all", label: "All 2FA Status" },
  { value: "enabled", label: "Enabled" },
  { value: "enforced", label: "Enforced" },
  { value: "disabled", label: "Disabled" },
];

export function UsersFilters({
  filters,
  setFilters,
  sort,
  setSort,
  selectedCount,
  onBulkAction,
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const hasActiveFilters =
    filters.search ||
    (filters.role && filters.role !== "all") ||
    (filters.status && filters. status !== "all") ||
    (filters.twoFactorStatus && filters.twoFactorStatus !== "all");

  const activeFilterCount =
    (filters.role && filters.role !== "all" ?  1 : 0) +
    (filters.status && filters.status !== "all" ? 1 : 0) +
    (filters. twoFactorStatus && filters.twoFactorStatus !== "all" ? 1 : 0);

  const clearFilters = () => {
    setFilters({});
  };

  const bulkActions:  { action: BulkAction; label: string; icon:  React.ElementType }[] = [
    { action:  "activate", label:  "Activate", icon: UserCheck },
    { action: "suspend", label: "Suspend", icon:  UserX },
    { action: "deactivate", label: "Deactivate", icon: UserX },
    { action:  "reset_password", label:  "Reset Password", icon: Mail },
    { action: "enable_2fa", label: "Enforce 2FA", icon: Shield },
    { action: "change_role", label:  "Change Role", icon: Shield },
    { action: "export", label: "Export", icon: Download },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "bg-white/10")}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 w-5 h-5 bg-white text-black text-xs font-medium rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {selectedCount > 0 && (
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="border-violet-500/30 text-violet-400"
            >
              Actions ({selectedCount})
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showBulkMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowBulkMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-20 py-1">
                  {bulkActions.map(({ action, label, icon: Icon }) => (
                    <button
                      key={action}
                      onClick={() => {
                        onBulkAction(action);
                        setShowBulkMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4 text-zinc-500" />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        <Button variant="secondary">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      {showFilters && (
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Select
                label="Role"
                placeholder="Select role"
                options={roleOptions}
                value={filters. role || "all"}
                onChange={(value) => setFilters({ ... filters, role: value as SystemRole | "all" })}
              />
              <Select
                label="Status"
                placeholder="Select status"
                options={statusOptions}
                value={filters.status || "all"}
                onChange={(value) => setFilters({ ... filters, status: value as AccountStatus | "all" })}
              />
              <Select
                label="2FA Status"
                placeholder="Select 2FA status"
                options={twoFactorOptions}
                value={filters. twoFactorStatus || "all"}
                onChange={(value) => setFilters({ ...filters, twoFactorStatus: value as any })}
              />
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-zinc-500"
                  disabled={!hasActiveFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Active filters: </span>
          {filters.role && filters.role !== "all" && (
            <button
              onClick={() => setFilters({ ... filters, role: "all" })}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
            >
              Role:  {roleOptions.find((r) => r.value === filters.role)?.label}
              <X className="h-3 w-3" />
            </button>
          )}
          {filters.status && filters.status !== "all" && (
            <button
              onClick={() => setFilters({ ...filters, status: "all" })}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
            >
              Status: {statusOptions.find((s) => s.value === filters.status)?.label}
              <X className="h-3 w-3" />
            </button>
          )}
          {filters.twoFactorStatus && filters.twoFactorStatus !== "all" && (
            <button
              onClick={() => setFilters({ ...filters, twoFactorStatus: "all" })}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
            >
              2FA: {twoFactorOptions.find((t) => t.value === filters.twoFactorStatus)?.label}
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}