"use client";

import { useState, useEffect } from "react";
import { Shield, RotateCcw, Info } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { AdminUser, AdminPermissions, ROLE_PERMISSIONS, SystemRole } from "@/types/admin-user.types";
import { getRoleBadge } from "@/lib/mock-admin-users";
import { cn } from "@/lib/utils";

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (permissions: AdminPermissions) => Promise<void>;
  user: AdminUser;
}

const permissionGroups = [
  {
    title: "User Management",
    permissions: [
      { key: "users_view", label: "View Users", description: "Can view user list and profiles" },
      { key: "users_create", label: "Create Users", description: "Can create new user accounts" },
      { key: "users_edit", label: "Edit Users", description: "Can edit user profiles and settings" },
      { key: "users_delete", label: "Delete Users", description: "Can permanently delete users" },
    ],
  },
  {
    title: "Event Management",
    permissions: [
      { key: "events_view", label: "View Events", description: "Can view all events" },
      { key: "events_approve", label: "Approve Events", description: "Can approve/reject event submissions" },
      { key: "events_edit_all", label: "Edit All Events", description: "Can edit any event" },
      { key: "events_delete", label: "Delete Events", description: "Can delete events" },
    ],
  },
  {
    title: "Task Management",
    permissions: [
      { key: "tasks_view", label: "View Tasks", description: "Can view all tasks" },
      { key: "tasks_manage_all", label: "Manage All Tasks", description: "Can edit/delete any task" },
    ],
  },
  {
    title: "Access Control",
    permissions: [
      { key: "access_requests_view", label: "View Access Requests", description: "Can view pending requests" },
      { key: "access_requests_manage", label: "Manage Access Requests", description: "Can approve/reject requests" },
    ],
  },
  {
    title: "System",
    permissions: [
      { key: "system_settings", label: "System Settings", description: "Can modify system configuration" },
      { key: "audit_logs", label: "Audit Logs", description: "Can view audit logs" },
    ],
  },
  {
    title: "Members",
    permissions: [
      { key: "members_view", label: "View Members", description: "Can view all community members" },
      { key: "members_manage", label: "Manage Members", description: "Can add/edit/remove members" },
    ],
  },
  {
    title: "Reports",
    permissions: [
      { key: "reports_view", label: "View Reports", description: "Can view analytics and reports" },
      { key: "reports_export", label: "Export Reports", description: "Can export data and reports" },
    ],
  },
];

export function UserPermissionsModal({ isOpen, onClose, onSubmit, user }: UserPermissionsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const safeRole = (user?.role?.toLowerCase() as SystemRole) || "viewer";
  const defaultPermissions = ROLE_PERMISSIONS[safeRole] || ROLE_PERMISSIONS["viewer"];
  const [permissions, setPermissions] = useState<AdminPermissions>(user?.permissions || defaultPermissions);
  const roleBadge = getRoleBadge(safeRole) || { variant: "secondary", label: user?.role || "Viewer" };

  useEffect(() => {
    const updatedSafeRole = (user?.role?.toLowerCase() as SystemRole) || "viewer";
    const updatedDefaultPerms = ROLE_PERMISSIONS[updatedSafeRole] || ROLE_PERMISSIONS["viewer"];
    setPermissions(user?.permissions || updatedDefaultPerms);
    setHasChanges(false);
  }, [user]);

  const togglePermission = (key: keyof AdminPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setPermissions({ ...defaultPermissions });
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(permissions);
    } catch (error) {
      console.error("Failed to update permissions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCustom = JSON.stringify(permissions) !== JSON.stringify(defaultPermissions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Permissions" size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* User Info */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-sm text-white font-bold">
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{user.displayName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={roleBadge.variant as any}>{roleBadge.label}</Badge>
                {isCustom && <Badge variant="warning">Custom Permissions</Badge>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetToDefaults} className="text-zinc-500">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset to Defaults
          </Button>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-400">
            Custom permissions override role defaults. Changes will take effect immediately.
          </p>
        </div>

        {/* Permission Groups */}
        <div className="space-y-6">
          {permissionGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">{group.title}</h3>
              <div className="space-y-2">
                {group.permissions.map((perm) => {
                  const key = perm.key as keyof AdminPermissions;
                  const isEnabled = permissions ? permissions[key] : false;
                  const isDefault = defaultPermissions ? defaultPermissions[key] : false;
                  const isDifferent = isEnabled !== isDefault;
                  
                  return (
                    <div
                      key={perm.key}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        isDifferent ? "bg-amber-500/5 border-amber-500/20" : "bg-white/5 border-white/10"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-zinc-200">{perm.label}</p>
                          {isDifferent && (
                            <span className="text-[10px] text-amber-400 uppercase">Modified</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{perm.description}</p>
                      </div>
                      
                      {/* FIXED TOGGLE BUTTON */}
                      <button
                        type="button"
                        onClick={() => togglePermission(key)}
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors relative shrink-0 ml-4",
                          isEnabled ? "bg-emerald-500" : "bg-zinc-700"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                            isEnabled ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!hasChanges}
          leftIcon={<Shield className="h-4 w-4" />}
        >
          Save Permissions
        </Button>
      </div>
    </Modal>
  );
}