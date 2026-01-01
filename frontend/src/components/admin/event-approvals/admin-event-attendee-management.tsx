"use client";
import { useState } from "react";
import { mockEventAttendees } from "@/lib/mock-event-attendees";
import { EventAttendee } from "@/types/event.types";
import { Button, Input } from "@/components/ui";
import { Users, Plus, Search } from "lucide-react";

function generateInitials(name: string) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminEventAttendeeManagement({ eventId }: { eventId: string }) {
  // React to store changes (for demo, use local forceUpdate)
  const [_, forceUpdate] = useState(0);

  // Form fields for manual attendee creation
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search/filter for attendee list
  const [search, setSearch] = useState("");

  // Large attendee list support
  const eventAttendees = mockEventAttendees.filter(a => a.eventId === eventId);
  const filteredAttendees = search
    ? eventAttendees.filter(
        a =>
          a.user.displayName.toLowerCase().includes(search.toLowerCase()) ||
          a.user.email.toLowerCase().includes(search.toLowerCase()) ||
          ((a.user as { phone?: string }).phone ?? "").includes(search)
      )
    : eventAttendees;

  const handleAddAttendee = () => {
    setError(null);
    setAdding(true);

    const name = attendeeName.trim();
    const email = attendeeEmail.trim().toLowerCase();
    const phone = attendeePhone.trim();

    // Validate input
    if (!name || !email) {
      setError("Name and email are required");
      setAdding(false);
      return;
    }
    if (
      eventAttendees.some(a =>
        a.user.displayName.trim().toLowerCase() === name.toLowerCase() ||
        a.user.email.trim().toLowerCase() === email
      )
    ) {
      setError("Attendee already registered for this event");
      setAdding(false);
      return;
    }

    // Create attendee entry (no global user dependency)
    const newAttendee: EventAttendee = {
      id: `att-${eventId}-${Date.now()}`,
      eventId,
      userId: `manual-${Date.now()}`,
      user: {
        id: `manual-${Date.now()}`,
        displayName: name,
        email,
        avatarUrl: "",
        initials: generateInitials(name),
        ...(phone ? { phone } : {}),
      },
      status: "registered",
      registeredAt: new Date().toISOString(),
    };

    mockEventAttendees.push(newAttendee);
    forceUpdate(v => v + 1); // refresh list
    setAttendeeName("");
    setAttendeeEmail("");
    setAttendeePhone("");
    setAdding(false);
  };

  return (
    <div className="border-t border-white/5 mt-8 pt-4">
      <h3 className="font-semibold text-zinc-300 text-sm mb-4 flex gap-2 items-center">
        <Users className="h-4 w-4" /> Manually Add Attendee
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
        <Input
          placeholder="Full Name"
          value={attendeeName}
          onChange={e => setAttendeeName(e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Email Address"
          value={attendeeEmail}
          onChange={e => setAttendeeEmail(e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Phone Number (optional)"
          value={attendeePhone}
          onChange={e => setAttendeePhone(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex gap-3">
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleAddAttendee}
          isLoading={adding}
          className="min-w-32"
        >
          Add Attendee
        </Button>
      </div>
      {error && <div className="text-red-400 mt-2 text-xs">{error}</div>}

      <div className="mt-8 mb-2 flex items-center gap-2">
        <Search className="h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search attendees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <span className="text-xs text-zinc-500 ml-2">{filteredAttendees.length} displayed</span>
      </div>
      <div className="overflow-y-auto max-h-[340px] border rounded bg-zinc-950">
        <ul className="divide-y divide-zinc-800">
          {filteredAttendees.length === 0 ? (
            <li className="py-12 text-center text-zinc-400">No attendees found</li>
          ) : (
            filteredAttendees.map(a => (
              <li
                key={a.id}
                className="px-5 py-3 flex items-center gap-4"
              >
                <span className="rounded-full bg-violet-800 w-8 h-8 flex items-center justify-center font-medium text-white">
                  {a.user.initials}
                </span>
                <span className="font-semibold text-zinc-200 truncate">{a.user.displayName}</span>
                <span className="text-xs text-zinc-400 truncate">{a.user.email}</span>
                {(a.user as { phone?: string }).phone && (
                  <span className="text-xs text-zinc-500 ml-auto">{(a.user as { phone?: string }).phone}</span>
                )}
                <span className="ml-auto text-xs text-green-500">
                  {a.status === "registered" ? "Registered" : "Checked In"}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}