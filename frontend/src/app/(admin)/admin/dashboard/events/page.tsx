import { Metadata } from "next";
import { EventsList } from "@/components/events/events-list";

export const metadata: Metadata = {
  title:  "Events - Aeon",
  description: "Manage your events",
};

export default function EventsPage() {
  return <EventsList />;
}