"use client";

import { useState } from "react";
import { mockAdminEventApprovals, approvalStats } from "@/lib/mock-event-approvals";
import { EventApprovalsStats } from "./event-approvals-stats";
import { EventApprovalsFilters } from "./event-approvals-filters";
import { EventApprovalsList } from "./event-approvals-lists";
import { EventApprovalsDetails } from "./event-approvals-details";
import { Event } from "@/types/event.types";

export default function EventApprovalsPage() {
  const [events, setEvents] = useState<Event[]>(mockAdminEventApprovals);
  const [selected, setSelected] = useState<Event | null>(null);
  const [filterStatus, _setFilterStatus] = useState<"all" | "pending_approval" | "approved" | "rejected">("pending_approval");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, _setCategory] = useState("all");
  const [sortBy, _setSortBy] = useState("newest");

  // Wrappers to ensure string type for filterStatus, category, sortBy
  const setFilterStatus = (v: string) => _setFilterStatus(v as any);
  const setCategory = (v: string) => _setCategory(v);
  const setSortBy = (v: string) => _setSortBy(v);

  // Filtering
  const filteredEvents = events
    .filter(event => 
      (filterStatus === "all" || event.status === filterStatus) &&
      (category === "all" || event.category === category) &&
      (
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.createdByUser.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Approve event
  const handleApprove = (id: string) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Admin User" }
          : e
      )
    );
    if (selected?.id === id) setSelected({ ...selected, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Admin User" });
  };

  // Reject event
  const handleReject = (id: string, reason: string) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, status: "rejected", rejectedAt: new Date().toISOString(), rejectionReason: reason || "No reason provided" }
          : e
      )
    );
    if (selected?.id === id) setSelected({ ...selected, status: "rejected", rejectedAt: new Date().toISOString(), rejectionReason: reason || "No reason provided" } as Event);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <EventApprovalsStats stats={approvalStats} />
        <EventApprovalsFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={setCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EventApprovalsList
            events={filteredEvents}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
          <EventApprovalsDetails
            event={selected}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
}