"use client";
import dynamic from "next/dynamic";

const EventApprovalsPage = dynamic(() =>
  import("@/components/admin/event-approvals/event-approvals-page"),
  { ssr: false }
);

export default function AdminEventApprovalsRoute() {
  return <EventApprovalsPage />;
}