import { Metadata } from "next";
import { EventCheckIn } from "@/components/events/event-check-in";

export const metadata: Metadata = {
  title: "Event Check-in - Aeon",
  description: "Check in event attendees",
};

interface CheckInPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { eventId } = await params;
  return <EventCheckIn eventId={eventId} />;
}