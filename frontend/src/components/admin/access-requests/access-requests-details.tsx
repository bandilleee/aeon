import {
  Calendar,
  Mail,
  Phone,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

export function AccessRequestsDetails({ request, onApprove, onReject }:{
  request: any,
  onApprove: (id: string) => void,
  onReject: (id: string) => void
}) {
  if (!request) {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-xl p-12 text-center sticky top-4">
        <Eye className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">Select a request</p>
        <p className="text-sm text-zinc-600 mt-2">
          Click on a request in the list to view details here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-white/5 rounded-3xl sticky top-4 max-h-[calc(100vh-2rem)] flex flex-col">
      <div className="p-6 border-b border-white/5 shrink-0">
        <h2 className="text-lg font-semibold text-white">Request Details</h2>
      </div>
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-violet-700 text-white flex items-center justify-center text-xl font-semibold">
            {request.avatar}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              {request.name}
            </h3>
            <p className="text-sm text-zinc-500">{request.id}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Info label="Status">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              request.status === "pending"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : request.status === "approved"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {request.status[0].toUpperCase() + request.status.slice(1)}
            </span>
          </Info>
          <Info label="Email">
            <Mail className="h-4 w-4 text-zinc-500 mr-1" />
            {request.email}
          </Info>
          <Info label="Phone">
            <Phone className="h-4 w-4 text-zinc-500 mr-1" />
            {request.phone}
          </Info>
          <Info label="Organization">
            <Building2 className="h-4 w-4 text-zinc-500 mr-1" />
            {request.organization}
          </Info>
          <Info label="Role">
            <User className="h-4 w-4 text-zinc-500 mr-1" />
            {request.role}
          </Info>
          <Info label="Requested Access Level">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {request.requestedAccess}
            </span>
          </Info>
          <Info label="Submitted">
            <Calendar className="h-4 w-4 text-zinc-500 mr-1" />
            {new Date(request.submittedAt).toLocaleString("en-ZA")}
          </Info>
          <Info label="Reason">
            <span className="text-sm text-zinc-400 leading-relaxed">
              {request.reason}
            </span>
          </Info>
          {request.status === "approved" && (
            <div className="pt-4 border-t border-white/5">
              <Info label="Approved By">
                <span className="text-sm text-zinc-300">{request.approvedBy}</span>
              </Info>
              <Info label="Approved At">
                <span className="text-xs text-zinc-600 mt-1">{new Date(request.approvedAt).toLocaleString("en-ZA")}</span>
              </Info>
            </div>
          )}
          {request.status === "rejected" && (
            <div className="pt-4 border-t border-white/5">
              <Info label="Rejected By">
                <span className="text-sm text-zinc-300">{request.rejectedBy}</span>
              </Info>
              <Info label="Rejected At">
                <span className="text-xs text-zinc-600 mt-1">{new Date(request.rejectedAt).toLocaleString("en-ZA")}</span>
              </Info>
              <div className="mt-3 text-sm text-red-400">
                {request.rejectionReason}
              </div>
            </div>
          )}
        </div>
        {request.status === "pending" && (
          <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
            <button
              onClick={() => onApprove(request.id)}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Request
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="w-full px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Generic info row for detail fields
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-zinc-600 uppercase tracking-wide">{label}</label>
      <div className="mt-2 flex items-center gap-1 text-sm text-zinc-300">{children}</div>
    </div>
  );
}