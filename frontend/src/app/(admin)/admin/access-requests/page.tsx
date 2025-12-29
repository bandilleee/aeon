"use client";
import dynamic from "next/dynamic";


const AccessRequestsPage = dynamic(() => import("@/components/admin/access-requests/access-requests-page"), { ssr: false });

export default function AccessRequests() {
  return <AccessRequestsPage />;
}