"use client";

import { useState } from "react";
import { UserPlus, Search, X, Check } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { EventAttendee } from "@/types/event.types";
import { mockUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AddAttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (attendee: Omit<EventAttendee, "id" | "eventId" | "registeredAt">) => Promise<void>;
  eventTitle: string;
}

type AddMode = "existing" | "manual";

export function AddAttendeeModal({
  isOpen,
  onClose,
  onAdd,
  eventTitle,
}: AddAttendeeModalProps) {
  const [mode, setMode] = useState<AddMode>("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Manual entry fields
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  // Filter users based on search
  const filteredUsers = mockUsers.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId);

  const resetForm = () => {
    setSearchQuery("");
    setSelectedUserId(null);
    setManualName("");
    setManualEmail("");
    setManualPhone("");
    setMode("existing");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === "existing" && selectedUser) {
        await onAdd({
          userId: selectedUser.id,
          user: {
            id: selectedUser.id,
            displayName: selectedUser.displayName,
            email: selectedUser.email,
            initials: selectedUser.initials,
          },
          status: "registered",
        });
      } else if (mode === "manual" && manualName && manualEmail) {
        const initials = manualName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        await onAdd({
          userId: `manual_${Date.now()}`,
          user: {
            id: `manual_${Date.now()}`,
            displayName: manualName,
            email: manualEmail,
            initials,
            phone: manualPhone || undefined,
          },
          status: "registered",
        });
      }
      resetForm();
    } catch (error) {
      console.error("Failed to add attendee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    (mode === "existing" && selectedUserId) ||
    (mode === "manual" && manualName.trim() && manualEmail.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Attendee"
      description={`Add an attendee to "${eventTitle}"`}
      size="md"
    >
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg">
          <button
            onClick={() => setMode("existing")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              mode === "existing"
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Existing User
          </button>
          <button
            onClick={() => setMode("manual")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              mode === "manual"
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Manual Entry
          </button>
        </div>
        {mode === "existing" ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* User List */}
            <div className="max-h-60 overflow-y-auto space-y-1 border border-white/5 rounded-lg p-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-zinc-500">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                      selectedUserId === user.id
                        ? "bg-white/10 border border-white/20"
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-xs text-white font-bold border border-white/10">
                      {user.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    {selectedUserId === user.id && (
                      <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          /* Manual Entry Form */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Phone Number <span className="text-zinc-600">(optional)</span>
              </label>
              <input
                type="tel"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>
        )}
        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Add Attendee
          </Button>
        </div>
      </div>
    </Modal>
  );
}