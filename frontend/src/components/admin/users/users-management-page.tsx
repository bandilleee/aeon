"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminUser, UserFilters, UserSort, SystemRole, AccountStatus, BulkAction, ROLE_PERMISSIONS } from "@/types/admin-user.types";
import { UsersStats } from "./users-stats";
import { UsersFilters } from "./users-filters";
import { UsersTable } from "./users-table";
import { UserDetailsPanel } from "./user-details-panel";
import { CreateUserModal } from "./create-user-modal";
import { EditUserModal } from "./edit-user-modal";
import { UserPermissionsModal } from "./user-permissions-modal";
import { BulkActionsModal } from "./bulk-actions-modal";
import { adminUsersService } from "@/services/admin-users.service";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [sort, setSort] = useState<UserSort>({ field: "displayName", direction: "asc" });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState<BulkAction | null>(null);

  // --- FETCH REAL USERS ---
  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        const response = await adminUsersService.getAllUsers();
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

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
          (user.displayName && user.displayName.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (filters.role && filters.role !== "all" && user.role !== filters.role) return false;
      if (filters.status && filters.status !== "all" && user.status !== filters.status) return false;
      return true;
    });

    result.sort((a, b) => {
      let aVal: any = a[sort.field as keyof AdminUser] || "";
      let bVal: any = b[sort.field as keyof AdminUser] || "";
      
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, filters, sort]);

  const handleCreateUser = async (userData: any) => {
    const res = await adminUsersService.createUser(userData);
    if (res.success) {
      // Refresh the list to get the new user from the DB
      const updatedList = await adminUsersService.getAllUsers();
      if (updatedList.success && updatedList.data) setUsers(updatedList.data);
      setShowCreateModal(false);
    } else {
      alert("Failed to create user: " + res.error?.message);
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    await adminUsersService.updateUser(userId, userData);
    
    // Optimistic UI Update
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...userData, displayName: `${userData.firstName} ${userData.lastName}` } : u));
    setShowEditModal(false);
  };

  const handleUpdatePermissions = async (userId: string, permissions: any) => {

    await adminUsersService.updatePermissions(userId, permissions);
    // Keep Optimistic UI update logic exactly the same as your original file
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const defaultPerms = ROLE_PERMISSIONS[user.role];
    const isCustom = JSON.stringify(permissions) !== JSON.stringify(defaultPerms);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, permissions, customPermissions: isCustom } : u));
    setShowPermissionsModal(false);
  };

  const handleStatusChange = async (userId: string, status: AccountStatus, reason?: string) => {
    await adminUsersService.updateStatus(userId, status, reason);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status, statusReason: reason } : u));
    if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, status, statusReason: reason } : null);
  };

  const handleBulkAction = async (action: BulkAction, userIds: string[], options?: any) => {
    // Basic optimistic bulk update to keep UI responsive
    setUsers((prev) => prev.map((u) => {
      if (!userIds.includes(u.id)) return u;
      if (action === "activate") return { ...u, status: "active" };
      if (action === "suspend") return { ...u, status: "suspended" };
      return u;
    }));
    setSelectedUserIds([]);
    setShowBulkActionsModal(false);
    setSelectedBulkAction(null);
  };

  const handleDeleteUser = async (userId: string) => {
    const res = await adminUsersService.deleteUser(userId);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    } else {
      alert("Error: " + res.error?.message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    alert("Password reset email would be sent here.");
  };

  const handleUnlockAccount = async (userId: string) => {
    await handleStatusChange(userId, "active");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
         <Loader2 className="h-10 w-10 animate-spin mb-4 text-violet-500" />
         <p className="text-zinc-400">Loading admin users...</p>
      </div>
    );
  }

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