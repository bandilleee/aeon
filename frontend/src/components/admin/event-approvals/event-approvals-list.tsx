"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { ConfirmationModal, Modal } from "@/components/ui/modal";
import { Event } from "@/types/event.types";
import { getEventStatusBadge, getEventCategoryBadge } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface EventApprovalsListProps {
  events: Event[];
  onSelect: (event: Event) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  selectedId?: string;
}

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:  "numeric",
  });
}

function formatEventTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute:  "2-digit",
    hour12: true,
  });
}

export function EventApprovalsList({
  events,
  onSelect,
  onApprove,
  onReject,
  selectedId,
}: EventApprovalsListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [targetEvent, setTargetEvent] = useState<Event | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApproveClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setTargetEvent(event);
    setShowApproveModal(true);
  };

  const handleRejectClick = (e:  React.MouseEvent, event: Event) => {
    e. stopPropagation();
    setTargetEvent(event);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!targetEvent) return;
    setProcessingId(targetEvent.id);
    await onApprove(targetEvent. id);
    setProcessingId(null);
    setShowApproveModal(false);
    setTargetEvent(null);
  };

  const confirmReject = async () => {
    if (!targetEvent) return;
    setProcessingId(targetEvent.id);
    await onReject(targetEvent.id, rejectionReason || "No reason provided");
    setProcessingId(null);
    setShowRejectModal(false);
    setTargetEvent(null);
    setRejectionReason("");
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No events found</h3>
          <p className="text-sm text-zinc-500">
            Try adjusting your filters to find what you're looking for. 
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
        {events.map((event) => {
          const statusBadge = getEventStatusBadge(event. status);
          const categoryBadge = getEventCategoryBadge(event. category);
          const isSelected = selectedId === event.id;
          const isProcessing = processingId === event.id;
          return (
            <Card
              key={event. id}
              variant="hover"
              className={cn(
                "cursor-pointer transition-all",
                isSelected && "ring-1 ring-white/20 bg-white/5"
              )}
              onClick={() => onSelect(event)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Date Box */}
                  <div className="shrink-0 w-14 h-14 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500 uppercase">
                      {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl font-semibold text-zinc-200">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={statusBadge. variant}>{statusBadge.label}</Badge>
                      <Badge variant={categoryBadge.variant}>{categoryBadge. label}</Badge>
                      {event.isVirtual && (
                        <Badge variant="info">
                          <Video className="h-3 w-3 mr-1" />
                          Virtual
                        </Badge>
                      )}
                    </div>
                    {/* Title */}
                    <h3 className="text-base font-medium text-zinc-100 truncate mb-1">
                      {event.title}
                    </h3>
                    {/* Creator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[8px] text-white font-bold border border-white/10">
                        {event.createdByUser.initials}
                      </div>
                      <span className="text-xs text-zinc-500">
                        by {event.createdByUser.displayName}
                      </span>
                    </div>
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatEventTime(event.startDate)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{event.location}</span>
                        </div>
                      )}
                      {event.maxAttendees && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {event. currentAttendees}/{event.maxAttendees}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {event.status === "pending_approval" && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => handleApproveClick(e, event)}
                          disabled={isProcessing}
                          className="text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => handleRejectClick(e, event)}
                          disabled={isProcessing}
                          className="text-red-400 hover: bg-red-500/10 hover: border-red-500/20"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-zinc-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Approve Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setTargetEvent(null);
        }}
        onConfirm={confirmApprove}
        title="Approve Event?"
        description={`Are you sure you want to approve "${targetEvent?.title}"? The event will become visible to members based on its visibility settings.`}
        confirmText="Approve Event"
        cancelText="Cancel"
        isLoading={processingId === targetEvent?.id}
      />
      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setTargetEvent(null);
          setRejectionReason("");
        }}
        title="Reject Event"
        description="Provide a reason for rejecting this event.  The creator will be notified."
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-300 mb-2">
              Event:  <span className="font-medium text-white">{targetEvent?. title}</span>
            </p>
          </div>
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
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false);
                setTargetEvent(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              onClick={confirmReject}
              isLoading={processingId === targetEvent?. id}
            >
              Reject Event
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}