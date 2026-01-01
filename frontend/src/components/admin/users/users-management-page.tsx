"use client";

import { useState, useMemo } from "react";
import {
  AdminUser,
  UserFilters,
  UserSort,
  SystemRole,
  AccountStatus,
  BulkAction,
  ROLE_PERMISSIONS,
} from "@/types/admin-user.types";
import { mockAdminUsers } from "@/lib/mock-admin-users";
import { UsersStats } from "./users-stats";
import { UsersFilters } from "./users-filters";
import { UsersTable } from "./users-table";
import { UserDetailsPanel } from "./user-details-panel";
import { CreateUserModal } from "./create-user-modal";
import { EditUserModal } from "./edit-user-modal";
import { UserPermissionsModal } from "./user-permissions-modal";
import { BulkActionsModal } from "./bulk-actions-modal";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [sort, setSort] = useState<UserSort>({ field: "displayName", direction: "asc" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState<BulkAction | null>(null);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const pending = users.filter((u) => u.status === "pending").length;
    const suspended = users.filter((u) => u.status === "suspended" || u.status === "locked").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const leaders = users.filter((u) => u.role === "community_leader").length;
    const twoFactorEnabled = users.filter((u) => u.twoFactorStatus === "enabled" || u.twoFactorStatus === "enforced").length;
    return { total, active, pending, suspended, admins, leaders, twoFactorEnabled };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          user.displayName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (filters.role && filters.role !== "all" && user.role !== filters.role) {
        return false;
      }
      if (filters.status && filters.status !== "all" && user.status !== filters.status) {
        return false;
      }
      if (filters.twoFactorStatus && filters.twoFactorStatus !== "all" && user.twoFactorStatus !== filters.twoFactorStatus) {
        return false;
      }
      if (filters.hasCustomPermissions !== undefined && user.customPermissions !== filters.hasCustomPermissions) {
        return false;
      }
      if (filters.tags && filters.tags.length > 0) {
        const userTags = user.tags || [];
        const hasTag = filters.tags.some((t) => userTags.includes(t));
        if (!hasTag) return false;
      }
      return true;
    });
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      switch (sort.field) {
        case "displayName":
          aVal = a.displayName.toLowerCase();
          bVal = b.displayName.toLowerCase();
          break;
        case "email":
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case "role": 
          const roleOrder = { admin: 0, community_leader: 1, moderator: 2, viewer: 3 };
          aVal = roleOrder[a.role];
          bVal = roleOrder[b.role];
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "lastLoginAt":
          aVal = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bVal = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        case "createdAt": 
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, filters, sort]);

  const handleCreateUser = async (userData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newUser: AdminUser = {
      id: `usr_${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: `${userData.firstName} ${userData.lastName}`,
      initials: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
      phone: userData.phone,
      role: userData.role as SystemRole,
      permissions: { ...ROLE_PERMISSIONS[userData.role as SystemRole] },
      customPermissions: false,
      status: "pending",
      twoFactorStatus: "disabled",
      mustChangePassword: userData.mustChangePassword,
      failedLoginAttempts: 0,
      loginCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: userData.notes,
      tags: userData.tags,
    };
    setUsers((prev) => [newUser, ...prev]);
    setShowCreateModal(false);
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...userData,
              displayName: `${userData.firstName || u.firstName} ${userData.lastName || u.lastName}`,
              initials: `${(userData.firstName || u.firstName)[0]}${(userData.lastName || u.lastName)[0]}`.toUpperCase(),
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              ...userData,
              displayName: `${userData.firstName || prev.firstName} ${userData.lastName || prev.lastName}`,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }
    setShowEditModal(false);
  };

  const handleUpdatePermissions = async (userId: string, permissions: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const defaultPerms = ROLE_PERMISSIONS[user.role];
    const isCustom = JSON.stringify(permissions) !== JSON.stringify(defaultPerms);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, permissions, customPermissions: isCustom, updatedAt: new Date().toISOString() }
          : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev ? { ...prev, permissions, customPermissions: isCustom, updatedAt: new Date().toISOString() } : null
      );
    }
    setShowPermissionsModal(false);
  };

  const handleStatusChange = async (userId: string, status: AccountStatus, reason?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status,
              statusReason: reason,
              statusChangedAt: new Date().toISOString(),
              statusChangedBy: "Current Admin",
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              status,
              statusReason: reason,
              statusChangedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }
  };

  const handleBulkAction = async (action: BulkAction, userIds: string[], options?: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    switch (action) {
      case "activate":
        setUsers((prev) =>
          prev.map((u) =>
            userIds.includes(u.id) ? { ...u, status: "active" as AccountStatus, updatedAt: new Date().toISOString() } : u
          )
        );
        break;
      case "suspend":
        setUsers((prev) =>
          prev.map((u) =>
            userIds.includes(u.id)
              ? {
                  ...u,
                  status: "suspended" as AccountStatus,
                  statusReason: options?.reason,
                  statusChangedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : u
          )
        );
        break;
      case "deactivate":
        setUsers((prev) =>
          prev.map((u) =>
            userIds.includes(u.id)
              ? {
                  ...u,
                  status: "deactivated" as AccountStatus,
                  statusReason: options?.reason,
                  statusChangedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : u
          )
        );
        break;
      case "change_role":
        setUsers((prev) =>
          prev.map((u) =>
            userIds.includes(u.id)
              ? {
                  ...u,
                  role: options?.role as SystemRole,
                  permissions: ROLE_PERMISSIONS[options?.role as SystemRole],
                  customPermissions: false,
                  updatedAt: new Date().toISOString(),
                }
              : u
          )
        );
        break;
      case "enable_2fa":
        setUsers((prev) =>
          prev.map((u) =>
            userIds.includes(u.id)
              ? { ...u, twoFactorStatus: "enforced" as const, updatedAt: new Date().toISOString() }
              : u
          )
        );
        break;
    }
    setSelectedUserIds([]);
    setShowBulkActionsModal(false);
    setSelectedBulkAction(null);
  };

  const handleDeleteUser = async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, mustChangePassword: true, updatedAt: new Date().toISOString() } : u
      )
    );
  };

  const handleUnlockAccount = async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: "active" as AccountStatus,
              failedLoginAttempts: 0,
              lockedUntil: undefined,
              statusReason: undefined,
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) =>
        prev
          ? { ...prev, status: "active", failedLoginAttempts: 0, lockedUntil: undefined, statusReason: undefined }
          : null
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
              User Management
            </h1>
            <p className="text-sm text-zinc-500">
              Manage community leaders, moderators, and platform access. 
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>
        <UsersStats stats={stats} />
        <UsersFilters
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          selectedCount={selectedUserIds.length}
          onBulkAction={(action) => {
            setSelectedBulkAction(action);
            setShowBulkActionsModal(true);
          }}
        />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <UsersTable
              users={filteredUsers}
              selectedIds={selectedUserIds}
              onSelectionChange={setSelectedUserIds}
              onSelectUser={setSelectedUser}
              selectedUserId={selectedUser?.id}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
          <div className="xl:col-span-1">
            <UserDetailsPanel
              user={selectedUser}
              onEdit={() => setShowEditModal(true)}
              onEditPermissions={() => setShowPermissionsModal(true)}
              onStatusChange={handleStatusChange}
              onResetPassword={handleResetPassword}
              onUnlock={handleUnlockAccount}
              onDelete={handleDeleteUser}
            />
          </div>
        </div>
      </div>
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />
      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSubmit={(data) => handleUpdateUser(selectedUser.id, data)}
            user={selectedUser}
          />
          <UserPermissionsModal
            isOpen={showPermissionsModal}
            onClose={() => setShowPermissionsModal(false)}
            onSubmit={(perms) => handleUpdatePermissions(selectedUser.id, perms)}
            user={selectedUser}
          />
        </>
      )}
      <BulkActionsModal
        isOpen={showBulkActionsModal}
        onClose={() => {
          setShowBulkActionsModal(false);
          setSelectedBulkAction(null);
        }}
        action={selectedBulkAction}
        selectedUsers={users.filter((u) => selectedUserIds.includes(u.id))}
        onConfirm={(options) => {
          if (selectedBulkAction) {
            handleBulkAction(selectedBulkAction, selectedUserIds, options);
          }
        }}
      />
    </div>
  );
}