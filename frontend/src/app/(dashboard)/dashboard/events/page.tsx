import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events - Aeon",
  description: "Manage your events",
};

export default function EventsPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold text-white mb-2">Events</h1>
      <p className="text-zinc-500">Events module coming soon...</p>
    </div>
  );
}