"use client";

import {
  ChevronUp,
  ChevronDown,
  Shield,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import { AdminUser, UserSort, UserSortField } from "@/types/admin-user.types";
import { getRoleBadge, getStatusBadge } from "@/lib/mock-admin-users";
import { cn } from "@/lib/utils";

interface UsersTableProps {
  users: AdminUser[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onSelectUser: (user: AdminUser) => void;
  selectedUserId?: string;
  sort: UserSort;
  onSortChange: (sort: UserSort) => void;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export function UsersTable({
  users,
  selectedIds,
  onSelectionChange,
  onSelectUser,
  selectedUserId,
  sort,
  onSortChange,
}: UsersTableProps) {
  const allSelected = users.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(users.map((u) => u.id));
    }
  };

  const handleSelectOne = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onSelectionChange(selectedIds.filter((id) => id !== userId));
    } else {
      onSelectionChange([...selectedIds, userId]);
    }
  };

  const handleSort = (field: UserSortField) => {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ field, direction: "asc" });
    }
  };

  const SortIcon = ({ field }: { field: UserSortField }) => {
    if (sort.field !== field) return null;
    return sort.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No users found</h3>
          <p className="text-sm text-zinc-500">Try adjusting your filters or add a new user.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-white focus:ring-white/20"
                  />
                </th>
                <th
                  className="p-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                  onClick={() => handleSort("displayName")}
                >
                  <div className="flex items-center gap-1">
                    User
                    <SortIcon field="displayName" />
                  </div>
                </th>
                <th
                  className="p-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-1">
                    Role
                    <SortIcon field="role" />
                  </div>
                </th>
                <th
                  className="p-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="p-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Security
                </th>
                <th
                  className="p-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide cursor-pointer hover:text-zinc-300"
                  onClick={() => handleSort("lastLoginAt")}
                >
                  <div className="flex items-center gap-1">
                    Last Login
                    <SortIcon field="lastLoginAt" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                // DEFENSIVE FALLBACKS ADDED HERE
                const safeRole = user.role?.toLowerCase() as any;
                const safeStatus = user.status?.toLowerCase() as any;
                
                const roleBadge = getRoleBadge(safeRole) || { variant: "secondary", label: user.role || "Viewer" };
                const statusBadge = getStatusBadge(safeStatus) || { variant: "secondary", label: user.status || "Active" };
                
                const isSelected = selectedUserId === user.id;
                const isChecked = selectedIds.includes(user.id);
                return (
                  <tr
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className={cn(
                      "border-b border-white/5 cursor-pointer transition-colors",
                      isSelected ? "bg-white/5" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectOne(user.id)}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-white focus:ring-white/20"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-xs text-white font-bold border border-white/10">
                          {user.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-200">{user.displayName}</p>
                            {user.customPermissions && (
                              <span title="Has custom permissions">
                                <Shield className="h-3 w-3 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={roleBadge.variant as any}>{roleBadge.label}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                        {user.status === "locked" && (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <KeyRound
                          className={cn(
                            "h-4 w-4",
                            user.twoFactorStatus === "disabled" ? "text-zinc-600" : "text-emerald-400"
                          )}
                        />
                        <span className="text-xs text-zinc-500">
                          {user.twoFactorStatus === "disabled" ? "No 2FA" : "2FA"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-400">{formatDate(user.lastLoginAt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {users.length} user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}