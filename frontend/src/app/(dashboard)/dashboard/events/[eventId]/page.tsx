import { Metadata } from "next";
import { EventDetails } from "@/components/events/event-details";

export const metadata: Metadata = {
  title: "Event Details - Aeon",
  description: "View event details",
};

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  return <EventDetails eventId={eventId} />;
}