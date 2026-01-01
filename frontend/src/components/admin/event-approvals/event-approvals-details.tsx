"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  UserPlus,
  Trash2,
  ExternalLink,
  UserCheck,
  UserX,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { ConfirmationModal, Modal } from "@/components/ui/modal";
import { Event, EventAttendee } from "@/types/event.types";
import { getEventStatusBadge, getEventCategoryBadge } from "@/lib/mock-data";
import { AddAttendeeModal } from "./add-attendee-modal";
import { cn } from "@/lib/utils";

interface EventApprovalsDetailsProps {
  event: Event | null;
  attendees: EventAttendee[];
  onApprove: (id: string) => Promise<void>;
  onReject:  (id: string, reason: string) => Promise<void>;
  onAddAttendee:  (eventId: string, attendee:  Omit<EventAttendee, "id" | "eventId" | "registeredAt">) => Promise<void>;
  onRemoveAttendee:  (attendeeId: string) => Promise<void>;
  onUpdateAttendeeStatus: (attendeeId: string, status: EventAttendee["status"]) => Promise<void>;
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year:  "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours === 0) return `${diffMinutes} minutes`;
  if (diffMinutes === 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  return `${diffHours}h ${diffMinutes}m`;
}

function getVisibilityLabel(visibility: Event["visibility"]): string {
  const labels = {
    public: "Public",
    members_only: "Members Only",
    invite_only: "Invite Only",
  };
  return labels[visibility];
}

export function EventApprovalsDetails({
  event,
  attendees,
  onApprove,
  onReject,
  onAddAttendee,
  onRemoveAttendee,
  onUpdateAttendeeStatus,
}:  EventApprovalsDetailsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [showRemoveAttendeeModal, setShowRemoveAttendeeModal] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "attendees">("details");

  if (!event) {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-xl p-12 text-center sticky top-4">
        <Eye className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">Select an event</p>
        <p className="text-sm text-zinc-600 mt-2">
          Click on an event in the list to view details and manage attendees. 
        </p>
      </div>
    );
  }

  const statusBadge = getEventStatusBadge(event.status);
  const categoryBadge = getEventCategoryBadge(event.category);

  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(event.id);
    setIsProcessing(false);
    setShowApproveModal(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await onReject(event. id, rejectionReason || "No reason provided");
    setIsProcessing(false);
    setShowRejectModal(false);
    setRejectionReason("");
  };

  const handleRemoveAttendee = async () => {
    if (! selectedAttendee) return;
    setIsProcessing(true);
    await onRemoveAttendee(selectedAttendee.id);
    setIsProcessing(false);
    setShowRemoveAttendeeModal(false);
    setSelectedAttendee(null);
  };

  const handleStatusChange = async (attendee: EventAttendee, status: EventAttendee["status"]) => {
    await onUpdateAttendeeStatus(attendee. id, status);
  };

  // Stats for attendees
  const attendeeStats = {
    total: attendees.length,
    registered: attendees.filter((a) => a.status === "registered").length,
    checkedIn: attendees.filter((a) => a.status === "checked_in").length,
    cancelled: attendees.filter((a) => a.status === "cancelled").length,
    noShow: attendees. filter((a) => a.status === "no_show").length,
  };

  return (
    <>
      <div className="bg-zinc-950 border border-white/5 rounded-xl sticky top-4 max-h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={statusBadge.variant}>{statusBadge. label}</Badge>
                <Badge variant={categoryBadge. variant}>{categoryBadge.label}</Badge>
                {event.isVirtual && (
                  <Badge variant="info">
                    <Video className="h-3 w-3 mr-1" />
                    Virtual
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white truncate">{event.title}</h2>
              <p className="text-xs text-zinc-500 mt-1">ID: {event.id}</p>
            </div>
          </div>
          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 bg-zinc-900/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === "details"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("attendees")}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === "attendees"
                  ? "bg-white text-black"
                  :  "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Attendees ({attendees.length})
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "details" ?  (
            <div className="space-y-6">
              {/* Creator Info */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-sm text-white font-bold">
                  {event.createdByUser.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {event.createdByUser.displayName}
                  </p>
                  <p className="text-xs text-zinc-500">Event Creator</p>
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="text-xs text-zinc-600 uppercase tracking-wide">
                  Description
                </label>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {event. description}
                </p>
              </div>
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  icon={Calendar}
                  label="Date"
                  value={formatFullDate(event.startDate)}
                />
                <InfoCard
                  icon={Clock}
                  label="Time"
                  value={`${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                />
              </div>
              {/* Duration */}
              <InfoCard
                icon={Clock}
                label="Duration"
                value={getDuration(event.startDate, event.endDate)}
              />
              {/* Location */}
              {event.isVirtual ?  (
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wide">
                    Virtual Meeting
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-400" />
                    {event.virtualLink ?  (
                      <a
                        href={event.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        {event.virtualLink}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-zinc-500">No link provided</span>
                    )}
                  </div>
                </div>
              ) : (
                <InfoCard
                  icon={MapPin}
                  label="Location"
                  value={event.location || "No location specified"}
                />
              )}
              {/* Visibility & Registration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wide">
                    Visibility
                  </label>
                  <p className="mt-2 text-sm text-zinc-300">
                    {getVisibilityLabel(event.visibility)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wide">
                    Registration
                  </label>
                  <p className="mt-2 text-sm text-zinc-300">
                    {event.requiresRegistration ? "Required" : "Not Required"}
                  </p>
                </div>
              </div>
              {/* Capacity */}
              {event.maxAttendees && (
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wide">
                    Capacity
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-400">
                        {event. currentAttendees} / {event.maxAttendees} registered
                      </span>
                      <span className="text-zinc-500">
                        {Math.round((event.currentAttendees / event.maxAttendees) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          event. currentAttendees >= event.maxAttendees
                            ?  "bg-red-500"
                            : event.currentAttendees >= event.maxAttendees * 0.8
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        )}
                        style={{
                          width:  `${Math.min(100, (event.currentAttendees / event.maxAttendees) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* Timestamps */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-600">Created</span>
                  <span className="text-zinc-500">
                    {new Date(event.createdAt).toLocaleString("en-ZA")}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-600">Last Updated</span>
                  <span className="text-zinc-500">
                    {new Date(event.updatedAt).toLocaleString("en-ZA")}
                  </span>
                </div>
                {event.approvedBy && event.approvedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600">Approved By</span>
                    <span className="text-emerald-500">
                      {event.approvedBy} • {new Date(event.approvedAt).toLocaleString("en-ZA")}
                    </span>
                  </div>
                )}
              </div>
              {/* Rejection Reason */}
              {event.status === "rejected" && event.rejectionReason && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Rejection Reason</p>
                      <p className="text-sm text-red-400/80 mt-1">{event.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Attendees Tab */
            <div className="space-y-4">
              {/* Attendee Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-lg font-semibold text-zinc-100">{attendeeStats. total}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Total</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/20">
                  <p className="text-lg font-semibold text-emerald-400">{attendeeStats.checkedIn}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Checked In</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-center border border-amber-500/20">
                  <p className="text-lg font-semibold text-amber-400">{attendeeStats.registered}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Pending</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center border border-red-500/20">
                  <p className="text-lg font-semibold text-red-400">
                    {attendeeStats.cancelled + attendeeStats.noShow}
                  </p>
                  <p className="text-[10px] text-zinc-500 uppercase">Absent</p>
                </div>
              </div>
              {/* Add Attendee Button */}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowAddAttendeeModal(true)}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Add Attendee Manually
              </Button>
              {/* Attendees List */}
              {attendees.length === 0 ?  (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No attendees yet</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Add attendees manually or wait for registrations. 
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendees. map((attendee) => (
                    <AttendeeRow
                      key={attendee.id}
                      attendee={attendee}
                      onStatusChange={handleStatusChange}
                      onRemove={() => {
                        setSelectedAttendee(attendee);
                        setShowRemoveAttendeeModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Footer Actions */}
        {event.status === "pending_approval" && (
          <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowApproveModal(true)}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Approve Event
            </Button>
            <Button
              variant="secondary"
              className="w-full text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
              onClick={() => {
                setRejectionReason("");
                setShowRejectModal(true);
              }}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Reject Event
            </Button>
          </div>
        )}
      </div>
      {/* Approve Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Event?"
        description={`Are you sure you want to approve "${event.title}"? The event will become visible to members based on its visibility settings.`}
        confirmText="Approve Event"
        cancelText="Cancel"
        isLoading={isProcessing}
      />
      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason("");
        }}
        title="Reject Event"
        description="Provide a reason for rejecting this event.  The creator will be notified."
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e. target.value)}
              placeholder="Enter the reason for rejection..."
              rows={4}
              className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/20 focus: border-white/20 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              onClick={handleReject}
              isLoading={isProcessing}
            >
              Reject Event
            </Button>
          </div>
        </div>
      </Modal>
      {/* Add Attendee Modal */}
      <AddAttendeeModal
        isOpen={showAddAttendeeModal}
        onClose={() => setShowAddAttendeeModal(false)}
        onAdd={async (attendeeData) => {
          await onAddAttendee(event.id, attendeeData);
          setShowAddAttendeeModal(false);
        }}
        eventTitle={event.title}
      />
      {/* Remove Attendee Modal */}
      <ConfirmationModal
        isOpen={showRemoveAttendeeModal}
        onClose={() => {
          setShowRemoveAttendeeModal(false);
          setSelectedAttendee(null);
        }}
        onConfirm={handleRemoveAttendee}
        title="Remove Attendee?"
        description={`Are you sure you want to remove ${selectedAttendee?. user.displayName} from this event?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />
    </>
  );
}

// Helper Components
function InfoCard({
  icon:  Icon,
  label,
  value,
}:  {
  icon:  React.ElementType;
  label: string;
  value:  string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-600 uppercase tracking-wide">{label}</label>
      <div className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
        <Icon className="h-4 w-4 text-zinc-500" />
        <span>{value}</span>
      </div>
    </div>
  );
}

function AttendeeRow({
  attendee,
  onStatusChange,
  onRemove,
}: {
  attendee: EventAttendee;
  onStatusChange:  (attendee: EventAttendee, status: EventAttendee["status"]) => void;
  onRemove: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const statusColors = {
    registered: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    checked_in: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    no_show: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  const statusLabels = {
    registered: "Registered",
    checked_in: "Checked In",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10">
          {attendee.user.initials}
        </div>
        <div>
          <p className="text-sm text-zinc-200">{attendee. user.displayName}</p>
          <p className="text-xs text-zinc-500">{attendee.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full border",
            statusColors[attendee.status]
          )}
        >
          {statusLabels[attendee.status]}
        </span>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-20 py-1">
                {attendee.status !== "checked_in" && (
                  <button
                    onClick={() => {
                      onStatusChange(attendee, "checked_in");
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    Check In
                  </button>
                )}
                {attendee.status === "checked_in" && (
                  <button
                    onClick={() => {
                      onStatusChange(attendee, "registered");
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <UserX className="h-4 w-4 text-amber-400" />
                    Undo Check In
                  </button>
                )}
                {attendee.status !== "no_show" && (
                  <button
                    onClick={() => {
                      onStatusChange(attendee, "no_show");
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover: bg-white/5 flex items-center gap-2"
                  >
                    <UserX className="h-4 w-4 text-zinc-400" />
                    Mark No Show
                  </button>
                )}
                {attendee.status !== "cancelled" && (
                  <button
                    onClick={() => {
                      onStatusChange(attendee, "cancelled");
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4 text-red-400" />
                    Mark Cancelled
                  </button>
                )}
                <div className="border-t border-white/5 my-1" />
                <button
                  onClick={() => {
                    onRemove();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover: bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}