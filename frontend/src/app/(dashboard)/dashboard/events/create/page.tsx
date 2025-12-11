import { Metadata } from "next";
import { CreateEventForm } from "@/components/events/create-event-form";

export const metadata: Metadata = {
  title:  "Create Event - Aeon",
  description: "Create a new event",
};

export default function CreateEventPage() {
  return <CreateEventForm />;
}