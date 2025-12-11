import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Requests - Aeon Admin",
  description: "Manage access requests",
};

export default function AccessRequestsPage() {
  return (
    <div className="p-4 md: p-8">
      <h1 className="text-2xl font-semibold text-white mb-2">Access Requests</h1>
      <p className="text-zinc-500">Access requests management coming soon...</p>
    </div>
  );
}