"use client";

import { useState } from "react";
import { Users, AlertTriangle } from "lucide-react";
import { Button, Badge, Select } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { AdminUser, BulkAction, SystemRole } from "@/types/admin-user.types";
import { getRoleBadge, getStatusBadge } from "@/lib/mock-admin-users";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: BulkAction | null;
  selectedUsers: AdminUser[];
  onConfirm: (options?:  any) => void;
}

const roleOptions = [
  { value: "community_leader", label:  "Community Leader" },
  { value:  "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
  { value: "viewer", label: "Viewer" },
];

export function BulkActionsModal({
  isOpen,
  onClose,
  action,
  selectedUsers,
  onConfirm,
}: BulkActionsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState("");
  const [newRole, setNewRole] = useState<SystemRole>("community_leader");

  if (!action) return null;

  const getActionConfig = () => {
    switch (action) {
      case "activate":
        return {
          title: "Activate Users",
          description:  `Are you sure you want to activate ${selectedUsers. length} user(s)?`,
          confirmText: "Activate All",
          variant: "default" as const,
        };
      case "suspend":
        return {
          title: "Suspend Users",
          description: `Are you sure you want to suspend ${selectedUsers. length} user(s)? They will be unable to access the platform.`,
          confirmText: "Suspend All",
          variant: "warning" as const,
          showReason: true,
        };
      case "deactivate":
        return {
          title: "Deactivate Users",
          description: `Are you sure you want to deactivate ${selectedUsers.length} user(s)? This action can be reversed by an admin.`,
          confirmText: "Deactivate All",
          variant: "danger" as const,
          showReason: true,
        };
      case "reset_password":
        return {
          title:  "Reset Passwords",
          description: `Send password reset emails to ${selectedUsers.length} user(s)?`,
          confirmText: "Send Reset Emails",
          variant: "default" as const,
        };
      case "enable_2fa":
        return {
          title:  "Enforce Two-Factor Authentication",
          description: `Enforce 2FA for ${selectedUsers.length} user(s)?  They will be required to set up 2FA on their next login.`,
          confirmText: "Enforce 2FA",
          variant: "default" as const,
        };
      case "change_role":
        return {
          title: "Change User Roles",
          description: `Change the role for ${selectedUsers.length} user(s)?`,
          confirmText: "Change Roles",
          variant: "default" as const,
          showRoleSelect: true,
        };
      case "export": 
        return {
          title: "Export Users",
          description:  `Export data for ${selectedUsers. length} user(s) to CSV? `,
          confirmText: "Export",
          variant: "default" as const,
        };
      default:
        return {
          title: "Confirm Action",
          description: `Perform action on ${selectedUsers. length} user(s)?`,
          confirmText: "Confirm",
          variant:  "default" as const,
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const options:  any = {};
      if (config.showReason) options.reason = reason;
      if (config.showRoleSelect) options.role = newRole;
      await onConfirm(options);
      setReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonClass = {
    default: "bg-white text-black hover:bg-zinc-200",
    warning: "bg-amber-500 text-black hover:bg-amber-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <div className="space-y-4">
        {/* Warning */}
        {(action === "suspend" || action === "deactivate") && (
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-400">{config.description}</p>
          </div>
        )}
        {action !== "suspend" && action !== "deactivate" && (
          <p className="text-sm text-zinc-400">{config.description}</p>
        )}
        {/* User List Preview */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Selected Users</p>
          <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-white/5 rounded-lg border border-white/10">
            {selectedUsers.slice(0, 5).map((user) => {
              const roleBadge = getRoleBadge(user.role);
              const statusBadge = getStatusBadge(user.status);
              return (
                <div key={user.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-[10px] text-white font-bold">
                      {user.initials}
                    </div>
                    <span className="text-sm text-zinc-300">{user.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleBadge.variant} className="text-[10px]">
                      {roleBadge.label}
                    </Badge>
                    <Badge variant={statusBadge.variant} className="text-[10px]">
                      {statusBadge.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {selectedUsers.length > 5 && (
              <p className="text-xs text-zinc-500 text-center py-1">
                +{selectedUsers.length - 5} more users
              </p>
            )}
          </div>
        </div>
        {/* Reason Input */}
        {config.showReason && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder:text-zinc-600"
              placeholder="Enter reason for this action..."
            />
          </div>
        )}
        {/* Role Select */}
        {config.showRoleSelect && (
          <Select
            label="New Role"
            placeholder="Select new role"
            options={roleOptions}
            value={newRole}
            onChange={(value) => setNewRole(value as SystemRole)}
          />
        )}
        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={`flex-1 ${buttonClass[config.variant]}`}
            onClick={handleConfirm}
            isLoading={isProcessing}
            leftIcon={<Users className="h-4 w-4" />}
          >
            {config.confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}