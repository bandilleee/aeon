import {
  Building2, User, CheckCircle2, XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AccessRequestsList({
  requests,
  onSelect,
  onApprove,
  onReject,
  selectedId
}: {
  requests: any[];
  onSelect: (req: any) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  selectedId: string|undefined;
}) {
  type Status = "pending" | "approved" | "rejected";
  const getStatusBadge = (status: Status | string) => {
    const variants: Record<Status, { className: string; label: string }> = {
      pending: {
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Pending",
      },
      approved: {
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        label: "Approved",
      },
      rejected: {
        className: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Rejected",
      },
    };
    const variant = variants[status as Status] || variants.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant.className}`}>
        {variant.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
  };

  if (!requests.length) return (
    <div className="bg-zinc-950 border border-white/5 rounded-xl p-12 text-center">
      <span className="text-zinc-400">No requests found.</span>
    </div>
  );

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          onClick={() => onSelect(request)}
          className={cn(
            "bg-zinc-950 border rounded-xl p-6 cursor-pointer transition-all hover:border-violet-500/50",
            selectedId === request.id
              ? "border-violet-500 bg-violet-500/5"
              : "border-white/5"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-violet-700 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
              {request.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    {request.name}
                  </h3>
                  <p className="text-sm text-zinc-500">{request.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(request.status)}
                  <span className="text-xs text-zinc-600">
                    {formatDate(request.submittedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {request.organization}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {request.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  {request.requestedAccess}
                </span>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2">
                {request.reason}
              </p>
              {request.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={e => { e.stopPropagation(); onApprove(request.id); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onReject(request.id); }}
                    className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}