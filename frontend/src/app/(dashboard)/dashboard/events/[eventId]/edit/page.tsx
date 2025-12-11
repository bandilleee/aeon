import { Metadata } from "next";
import { EditEventForm } from "@/components/events/edit-event-form";

export const metadata: Metadata = {
  title: "Edit Event - Aeon",
  description: "Edit your event",
};

interface EditEventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;
  return <EditEventForm eventId={eventId} />;
}