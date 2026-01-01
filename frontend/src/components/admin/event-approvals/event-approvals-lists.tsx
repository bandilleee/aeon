import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function EventApprovalsList({
  events,
  onSelect,
  selectedId,
}: {
  events: any[];
  onSelect: (event: any) => void;
  selectedId: string | undefined;
}) {
  if (!events.length) {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-xl p-12 text-center text-zinc-400">
        No events found.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const base =
      "px-3 py-0.5 rounded-full text-xs font-medium border select-none";
    switch (status) {
      case "pending_approval":
        return (
          <span className={cn(base, "bg-amber-500/10 text-amber-400 border-amber-500/20")}>
            Pending
          </span>
        );
      case "approved":
        return (
          <span className={cn(base, "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className={cn(base, "bg-red-500/10 text-red-400 border-red-500/20")}>
            Rejected
          </span>
        );
      default:
        return (
          <span className={cn(base, "bg-zinc-800 text-zinc-300 border-zinc-700/40")}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onSelect(event)}
          className={cn(
            "bg-zinc-950 border rounded-xl p-6 cursor-pointer transition-all hover:border-blue-500/50",
            selectedId === event.id
              ? "border-blue-500 bg-blue-500/5"
              : "border-white/5"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-900 flex flex-col items-center justify-center">
              <span className="text-xs text-blue-300 uppercase">
                {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
              </span>
              <span className="text-lg font-bold text-zinc-100">
                {new Date(event.startDate).getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    {event.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {event.createdByUser.displayName}
                  </p>
                </div>
                <div>{getStatusBadge(event.status)}</div>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 flex-wrap">
                <span>{event.category}</span>
                <span>
                  {event.isVirtual
                    ? "Virtual"
                    : event.location}
                </span>
                <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>
                  {event.currentAttendees} / {event.maxAttendees ?? "∞"} attending
                </span>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2 mt-2">
                {event.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}