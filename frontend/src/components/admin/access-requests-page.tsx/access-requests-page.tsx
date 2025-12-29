"use client";

import { useState } from "react";
// Import your real mock data here:
import { mockAccessRequests } from "@/lib/mock-access-requests";


import { AccessRequestsStats } from "./access-requests-stats";
import { AccessRequestsFilters } from "./access-requests-filters";
import { AccessRequestsList } from "./access-requests-lists";
import { AccessRequestsDetails } from "./access-requests-details";


export default function AccessRequestsPage() {
  // Example static stats array
  const stats = [
    { title: "Total Requests", value: mockAccessRequests.length, change: "+2", changeType: "positive", icon: () => null, iconColor: "" },
    { title: "Pending", value: mockAccessRequests.filter(r => r.status === "pending").length, change: "0", changeType: "neutral", icon: () => null, iconColor: "" },
    { title: "Approved", value: mockAccessRequests.filter((r: any) => r.status === "approved").length, change: "+1", changeType: "positive", icon: () => null, iconColor: "" },
    { title: "Rejected", value: mockAccessRequests.filter(r => r.status === "rejected").length, change: "-1", changeType: "negative", icon: () => null, iconColor: "" },
  ];

  const [requests, setRequests] = useState<any[]>(mockAccessRequests);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filtering logic
  const filteredRequests = requests.filter((req: any) => {
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    if (
      searchQuery &&
      !(
        req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Admin User" }
          : r
      )
    );
    if (selectedRequest?.id === id) setSelectedRequest({ ...selectedRequest, status: "approved" });
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "rejected", rejectedAt: new Date().toISOString(), rejectedBy: "Admin User", rejectionReason: "Manual rejection" }
          : r
      )
    );
    if (selectedRequest?.id === id) setSelectedRequest({ ...selectedRequest, status: "rejected" });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-full mx-auto space-y-6">
        <AccessRequestsStats stats={stats} />
        <AccessRequestsFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccessRequestsList
            requests={filteredRequests}
            onSelect={setSelectedRequest}
            onApprove={handleApprove}
            onReject={handleReject}
            selectedId={selectedRequest?.id}
          />
          <AccessRequestsDetails
            request={selectedRequest}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
}
