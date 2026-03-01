"use client";

import { useState, useEffect } from "react";
import { UserCheck, Clock, CheckCircle, XCircle, Loader2, Mail, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { accessRequestsService, AccessRequest } from "@/services/access-requests.service";
import { useAuth } from "@/contexts/auth-context";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

function formatDate(dateString: string) {
  const date = new Date(dateString.endsWith("Z") ? dateString : `${dateString}Z`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function timeAgo(dateString: string) {
  const date = new Date(dateString.endsWith("Z") ? dateString : `${dateString}Z`);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending:  { label: "Pending",  className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected: { label: "Rejected", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  }[status] ?? { label: status, className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" };

  return (
    <span className={cn("px-2 py-0.5 text-xs font-medium rounded border", config.className)}>
      {config.label}
    </span>
  );
}

interface ApproveModalProps {
  request: AccessRequest;
  onClose: () => void;
  onConfirm: (role: string, tempPassword: string, note: string) => Promise<void>;
}

function ApproveModal({ request, onClose, onConfirm }: ApproveModalProps) {
  const [role, setRole] = useState("member");
  const [tempPassword, setTempPassword] = useState("Welcome@123");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm(role, tempPassword, note);
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen onClose={onClose} title="Approve Access Request">
      <div className="space-y-4 p-1">
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
          <p className="text-sm text-emerald-400">
            Approving access for <strong>{request.firstName} {request.lastName}</strong> ({request.email})
          </p>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Assign Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <option value="member">Member</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Temporary Password</label>
          <input
            type="text"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <p className="text-xs text-zinc-600 mt-1">User will be required to change this on first login.</p>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any notes for this approval..."
            rows={2}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Create Account"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface RejectModalProps {
  request: AccessRequest;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

function RejectModal({ request, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen onClose={onClose} title="Reject Access Request">
      <div className="space-y-4 p-1">
        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">
            Rejecting request from <strong>{request.firstName} {request.lastName}</strong> ({request.email})
          </p>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">Reason for rejection <span className="text-red-400">*</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this request is being rejected..."
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()} className="flex-1 bg-red-600 hover:bg-red-500 text-white">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject Request"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RequestCard({ request, onApprove, onReject }: {
  request: AccessRequest;
  onApprove: (r: AccessRequest) => void;
  onReject: (r: AccessRequest) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-xs font-bold text-white border border-white/10 flex-shrink-0">
            {request.firstName[0]}{request.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100">
              {request.firstName} {request.lastName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3 w-3 text-zinc-600" />
              <p className="text-xs text-zinc-500 truncate">{request.email}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={request.status} />
          <span className="text-xs text-zinc-600">{timeAgo(request.createdAt)}</span>
        </div>
      </div>

      {/* Reason */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide reason" : "View reason"}
        </button>
        {expanded && (
          <p className="mt-2 text-sm text-zinc-400 bg-black/30 rounded-lg p-3 border border-white/5">
            {request.reason}
          </p>
        )}
      </div>

      {/* Review note if already reviewed */}
      {request.reviewNote && (
        <p className="mt-2 text-xs text-zinc-600 italic">Note: {request.reviewNote}</p>
      )}

      {/* Actions — only for pending */}
      {request.status === "pending" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onApprove(request)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium transition-all"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => onReject(request)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium transition-all"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function AccessRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [approveTarget, setApproveTarget] = useState<AccessRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AccessRequest | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const res = await accessRequestsService.getAll(filter === "all" ? undefined : filter);
      if (res.success && res.data) {
        setRequests(res.data as AccessRequest[]);
      }
    } catch (err) {
      console.error("Failed to load access requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [filter]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (role: string, tempPassword: string, note: string) => {
    if (!approveTarget) return;
    const res = await accessRequestsService.approve(approveTarget.id, {
      role,
      temporaryPassword: tempPassword,
      note,
      reviewedBy: user?.displayName || user?.email,
    });
    if (res.success) {
      showToast(`Account created for ${approveTarget.email}`, "success");
      setApproveTarget(null);
      loadRequests();
    } else {
      showToast("Failed to approve request", "error");
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    const res = await accessRequestsService.reject(rejectTarget.id, {
      reason,
      reviewedBy: user?.displayName || user?.email,
    });
    if (res.success) {
      showToast("Request rejected", "success");
      setRejectTarget(null);
      loadRequests();
    } else {
      showToast("Failed to reject request", "error");
    }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const filters: { value: FilterStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Access Requests</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Review and manage requests to join the platform.
          {pendingCount > 0 && filter === "pending" && (
            <span className="ml-2 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs">
              {pendingCount} pending
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", count: requests.filter(r => r.status === "pending").length },
          { label: "Approved", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", count: requests.filter(r => r.status === "approved").length },
          { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", count: requests.filter(r => r.status === "rejected").length },
        ].map(({ label, icon: Icon, color, bg, count }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="text-xl font-semibold text-zinc-100">{count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900/50 border border-white/5 rounded-lg w-fit">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-md transition-all",
              filter === value
                ? "bg-white/10 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 border border-white/5 rounded-xl">
          <UserCheck className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No {filter !== "all" ? filter : ""} requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={setApproveTarget}
              onReject={setRejectTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {approveTarget && (
        <ApproveModal
          request={approveTarget}
          onClose={() => setApproveTarget(null)}
          onConfirm={handleApprove}
        />
      )}
      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 px-4 py-3 rounded-lg border text-sm font-medium shadow-xl z-50 transition-all",
          toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          {toast.message}
        </div>
      )}
    </div>
  );
}