"use client";

import { useState } from "react";
import {
  Eye,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  KeyRound,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Lock,
  Unlock,
  RotateCcw,
  AlertTriangle,
  XCircle,
  Activity,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { ConfirmationModal, Modal } from "@/components/ui/modal";
import { AdminUser, AccountStatus } from "@/types/admin-user.types";
import { getRoleBadge, getStatusBadge, getTwoFactorBadge } from "@/lib/mock-admin-users";
import { cn } from "@/lib/utils";

interface UserDetailsPanelProps {
  user: AdminUser | null;
  onEdit: () => void;
  onEditPermissions: () => void;
  onStatusChange: (userId: string, status:  AccountStatus, reason?: string) => Promise<void>;
  onResetPassword: (userId: string) => Promise<void>;
  onUnlock: (userId: string) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

function formatFullDate(dateString?:  string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year:  "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math. floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export function UserDetailsPanel({
  user,
  onEdit,
  onEditPermissions,
  onStatusChange,
  onResetPassword,
  onUnlock,
  onDelete,
}: UserDetailsPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "security" | "activity">("info");

  if (!user) {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-xl p-12 text-center sticky top-4">
        <Eye className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">Select a user</p>
        <p className="text-sm text-zinc-600 mt-2">
          Click on a user in the table to view details. 
        </p>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role);
  const statusBadge = getStatusBadge(user.status);
  const twoFactorBadge = getTwoFactorBadge(user. twoFactorStatus);

  const handleSuspend = async () => {
    setIsProcessing(true);
    await onStatusChange(user.id, "suspended", statusReason);
    setIsProcessing(false);
    setShowSuspendModal(false);
    setStatusReason("");
  };

  const handleDeactivate = async () => {
    setIsProcessing(true);
    await onStatusChange(user. id, "deactivated", statusReason);
    setIsProcessing(false);
    setShowDeactivateModal(false);
    setStatusReason("");
  };

  const handleActivate = async () => {
    setIsProcessing(true);
    await onStatusChange(user.id, "active");
    setIsProcessing(false);
  };

  const handleUnlock = async () => {
    setIsProcessing(true);
    await onUnlock(user.id);
    setIsProcessing(false);
  };

  const handleResetPassword = async () => {
    setIsProcessing(true);
    await onResetPassword(user.id);
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    await onDelete(user.id);
    setIsProcessing(false);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-zinc-950 border border-white/5 rounded-xl sticky top-4 max-h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-lg text-white font-bold border-2 border-white/10">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-white truncate">{user. displayName}</h2>
                {user.customPermissions && (
                  <span title="Has custom permissions">
                    <Shield className="h-4 w-4 text-amber-400" />
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={roleBadge. variant}>{roleBadge.label}</Badge>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={onEdit} className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" onClick={onEditPermissions} className="flex-1">
              <Shield className="h-4 w-4 mr-1" />
              Permissions
            </Button>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 bg-zinc-900/50 p-1 rounded-lg">
            {(["info", "security", "activity"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors capitalize",
                  activeTab === tab ?  "bg-white text-black" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "info" && (
            <div className="space-y-5">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Contact Information
                </h3>
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Phone" value={user.phone || "Not provided"} />
              </div>
              {/* Tags */}
              {user.tags && user.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Notes */}
              {user.notes && (
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Notes</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{user.notes}</p>
                </div>
              )}
              {/* Timestamps */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <InfoRow icon={Calendar} label="Created" value={formatFullDate(user.createdAt)} />
                <InfoRow icon={Clock} label="Last Updated" value={formatFullDate(user.updatedAt)} />
                <InfoRow icon={Activity} label="Last Login" value={formatRelativeTime(user. lastLoginAt)} />
                <InfoRow icon={Activity} label="Login Count" value={user.loginCount. toString()} />
              </div>
            </div>
          )}
          {activeTab === "security" && (
            <div className="space-y-5">
              {/* Two-Factor Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <KeyRound
                      className={cn(
                        "h-5 w-5",
                        user.twoFactorStatus === "disabled" ? "text-zinc-600" : "text-emerald-400"
                      )}
                    />
                    <div>
                      <p className="text-sm text-zinc-200">2FA Status</p>
                      <Badge variant={twoFactorBadge.variant} className="mt-1">
                        {twoFactorBadge.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              {/* Password Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Password</h3>
                <div className="space-y-2">
                  {user.mustChangePassword && (
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-amber-400">Must change password on next login</span>
                    </div>
                  )}
                  <InfoRow
                    icon={Lock}
                    label="Last Changed"
                    value={formatRelativeTime(user. passwordLastChanged)}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={handleResetPassword}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Send Password Reset
                  </Button>
                </div>
              </div>
              {/* Account Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Account Status
                </h3>
                {user.status === "locked" && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <Lock className="h-4 w-4 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-400 font-medium">Account Locked</p>
                        <p className="text-xs text-red-400/70 mt-1">
                          {user.statusReason || "Too many failed login attempts"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Failed attempts: {user. failedLoginAttempts}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleUnlock}
                      disabled={isProcessing}
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Account
                    </Button>
                  </div>
                )}
                {user.status === "suspended" && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <UserX className="h-4 w-4 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-400 font-medium">Account Suspended</p>
                        <p className="text-xs text-red-400/70 mt-1">
                          {user.statusReason || "No reason provided"}
                        </p>
                        {user.statusChangedAt && (
                          <p className="text-xs text-zinc-500 mt-1">
                            Since:  {formatFullDate(user.statusChangedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {user.status === "pending" && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <p className="text-sm text-amber-400">Awaiting first login</p>
                    </div>
                  </div>
                )}
                {user.status === "active" && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <p className="text-sm text-emerald-400">Account is active</p>
                    </div>
                  </div>
                )}
                {user.status === "deactivated" && (
                  <div className="p-3 bg-zinc-500/10 border border-zinc-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-zinc-400 font-medium">Account Deactivated</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {user. statusReason || "No reason provided"}
                        </p>
                        {user.statusChangedAt && (
                          <p className="text-xs text-zinc-600 mt-1">
                            Since:  {formatFullDate(user.statusChangedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Login Activity */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Recent Activity
                </h3>
                <InfoRow icon={Activity} label="Last Login" value={formatRelativeTime(user.lastLoginAt)} />
                <InfoRow icon={Activity} label="Last Active" value={formatRelativeTime(user.lastActiveAt)} />
                <InfoRow icon={Activity} label="Total Logins" value={user.loginCount.toString()} />
              </div>
            </div>
          )}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500 text-center py-8">
                Activity log coming soon...
              </p>
            </div>
          )}
        </div>
        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
          {(user.status === "suspended" || user.status === "pending" || user.status === "deactivated") && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleActivate}
              disabled={isProcessing}
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              Activate Account
            </Button>
          )}
          {user.status === "active" && (
            <Button
              variant="secondary"
              className="w-full text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20"
              onClick={() => setShowSuspendModal(true)}
              leftIcon={<UserX className="h-4 w-4" />}
            >
              Suspend Account
            </Button>
          )}
          {user.status !== "deactivated" && (
            <Button
              variant="secondary"
              className="w-full text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
              onClick={() => setShowDeactivateModal(true)}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Deactivate Account
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full text-red-400 hover: bg-red-500/10"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete User
          </Button>
        </div>
      </div>
      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setStatusReason("");
        }}
        title="Suspend User"
        description="The user will be unable to access the platform until reactivated."
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-sm text-white font-bold">
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{user.displayName}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Reason for Suspension
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter the reason for suspending this account..."
              rows={3}
              className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2 focus: outline-none focus: ring-1 focus:ring-white/20 resize-none placeholder: text-zinc-600"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowSuspendModal(false);
                setStatusReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-500 text-black hover:bg-amber-600"
              onClick={handleSuspend}
              isLoading={isProcessing}
            >
              Suspend User
            </Button>
          </div>
        </div>
      </Modal>
      {/* Deactivate Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => {
          setShowDeactivateModal(false);
          setStatusReason("");
        }}
        title="Deactivate User"
        description="This will permanently disable the account.  The user will need to be reactivated by an admin."
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-sm text-white font-bold">
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{user.displayName}</p>
              <p className="text-xs text-zinc-500">{user. email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Reason for Deactivation
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter the reason for deactivating this account..."
              rows={3}
              className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2 focus: outline-none focus: ring-1 focus:ring-white/20 resize-none placeholder:text-zinc-600"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowDeactivateModal(false);
                setStatusReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeactivate}
              isLoading={isProcessing}
            >
              Deactivate User
            </Button>
          </div>
        </div>
      </Modal>
      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete User?"
        description={`Are you sure you want to permanently delete ${user.displayName}? This action cannot be undone. `}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}:  {
  icon:  React.ElementType;
  label: string;
  value:  string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-zinc-500" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-600">{label}</p>
        <p className="text-sm text-zinc-300 truncate">{value}</p>
      </div>
    </div>
  );
}