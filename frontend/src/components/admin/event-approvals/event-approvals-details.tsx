import { useState } from "react";
import {
  Calendar,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui";
import { AdminEventAttendeeManagement } from "./admin-event-attendee-management";
import { mockEventAttendees } from "@/lib/mock-event-attendees";
import { Event } from "@/types/event.types";

export function EventApprovalsDetails({ event, onApprove, onReject }: {
  event: Event | null,
  onApprove: (id: string) => void,
  onReject: (id: string, reason: string) => void
}) {
  const [rejectionReason, setRejectionReason] = useState("");

  if (!event) {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-xl p-12 text-center sticky top-4 text-zinc-400">
        Select an event to view details.
      </div>
    );
  }

  // Attendees are always pulled from the global store
  const attendees = mockEventAttendees.filter(a => a.eventId === event.id);

  const getStatusBadge = (status: string) => {
    if (status === "pending_approval")
      return <Badge variant="warning">Pending</Badge>;
    if (status === "approved")
      return <Badge variant="success">Approved</Badge>;
    if (status === "rejected")
      return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="neutral">{status}</Badge>;
  };

  return (
    <div className="bg-zinc-950 border border-white/5 rounded-xl sticky top-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-xl font-semibold">{event.title}</h2>
        <div className="mt-1">{getStatusBadge(event.status)}</div>
      </div>
      <div className="p-6 flex flex-col gap-5">
        {/* Standard event info omitted for brevity. Add all your event fields here as desired. */}
        <div>
          <label className="text-xs text-zinc-600 uppercase tracking-wide">Attendees</label>
          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-300">
            <Users className="h-4 w-4 text-zinc-400" />
            {attendees.length}
          </div>
        </div>
        {/* Approval/rejection actions */}
        {event.status === "pending_approval" && (
          <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
            <button
              onClick={() => onApprove(event.id)}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Event
            </button>
            <textarea
              className="w-full px-3 py-2 mt-2 bg-zinc-800 border border-red-400/30 rounded text-red-300 placeholder:text-red-300"
              placeholder="Reason for rejection (optional)"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />
            <button
              onClick={() => onReject(event.id, rejectionReason)}
              className="w-full mt-2 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject Event
            </button>
          </div>
        )}
        {/* Admin can always add/search attendees */}
        <AdminEventAttendeeManagement eventId={event.id} />
      </div>
    </div>
  );
}