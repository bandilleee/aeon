"use client";
import { useState, useEffect } from "react";
import { Member } from "@/types/member.types";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea, Button, Select } from "@/components/ui";

function validateName(name: string) {
  return /^[A-Za-z]+\s+[A-Za-z]*(\s*[A-Za-z]*)*$/.test(name.trim());
}
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function validatePhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, "");
  return /^\+27\d{9}$/.test(cleaned);
}

interface EditMemberModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
}

export function EditMemberModal({ member, isOpen, onClose, onSave }: EditMemberModalProps) {
  const [form, setForm] = useState<Member>({ ...member });
  const [errors, setErrors] = useState({ displayName: "", email: "", phone: "" });
  useEffect(() => {
    setForm({ ...member });
    setErrors({ displayName: "", email: "", phone: "" });
  }, [member]);

  function handleSave() {
    let valid = true;
    let errs = { displayName: "", email: "", phone: "" };

    if (!validateName(form.displayName)) {
      errs.displayName = "Please enter both name and surname (letters only).";
      valid = false;
    }
    if (!validateEmail(form.email)) {
      errs.email = "Please enter a valid email address.";
      valid = false;
    }
    if (!validatePhone(form.phone || "")) {
      errs.phone = "Phone number must start with +27 and have 9 digits (example: +27 123 456 789).";
      valid = false;
    }
    setErrors(errs);
    if (!valid) return;

    onSave(form); onClose();
  }

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "banned", label: "Banned" },
    { value: "left", label: "Left" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Member" size="sm">
      <div className="space-y-4">
        <Input
          label="Name & Surname"
          value={form.displayName}
          onChange={e => setForm((f: Member) => ({ ...f, displayName: e.target.value }))}
          error={errors.displayName}
          placeholder="e.g. Jane Doe"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={e => setForm((f: Member) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          placeholder="e.g. jane@example.com"
        />
        <Input
          label="Phone Number"
          value={form.phone || ""}
          onChange={e => setForm((f: Member) => ({ ...f, phone: e.target.value }))}
          error={errors.phone}
          placeholder="+27 123 456 789"
        />
        <Textarea
          label="Bio (optional)"
          value={form.bio || ""}
          onChange={e => setForm((f: Member) => ({ ...f, bio: e.target.value }))}
          placeholder="Short description about this member"
        />
        <Select
          label="Status"
          options={statusOptions}
          value={form.status}
          onChange={(val: string) => setForm((f: Member) => ({ ...f, status: val as Member["status"] }))}
        />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!form.displayName || !form.email || !form.phone}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}