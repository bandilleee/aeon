"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Button, Textarea, Checkbox } from "@/components/ui";

function validateName(name: string) {
  // Must be at least two words, only letters and spaces
  return /^[A-Za-z]+\s+[A-Za-z]*(\s*[A-Za-z]*)*$/.test(name.trim());
}

function validateEmail(email: string) {
  // Simple email regex for demonstration
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePhone(phone: string) {
  // Only +27 followed by space or no space, 9 digits (0123456789 or 012 345 6789)
  const cleaned = phone.replace(/\s+/g, "");
  return /^\+27\d{9}$/.test(cleaned);
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: { name: string; email: string; bio: string; phone: string; sendEmail: boolean; status: string }) => void;
}

export function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    sendEmail: true,
  });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });

  function handleChange(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  }

  function handleAdd() {
    let valid = true;
    let errs = { name: "", email: "", phone: "" };

    if (!validateName(form.name)) {
      errs.name = "Please enter both name and surname (letters only).";
      valid = false;
    }
    if (!validateEmail(form.email)) {
      errs.email = "Please enter a valid email address.";
      valid = false;
    }
    if (!validatePhone(form.phone)) {
      errs.phone = "Phone number must start with +27 and have 9 digits (example: +27 123 456 789).";
      valid = false;
    }
    setErrors(errs);
    if (!valid) return;

    onAdd({ ...form, status: "active" });
    setForm({ name: "", email: "", bio: "", phone: "", sendEmail: true });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Member" size="sm">
      <div className="space-y-4">
        <Input
          label="Name & Surname"
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="e.g. Jane Doe"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={e => handleChange("email", e.target.value)}
          error={errors.email}
          placeholder="e.g. jane@example.com"
        />
        <Input
          label="Phone Number"
          value={form.phone}
          onChange={e => handleChange("phone", e.target.value)}
          error={errors.phone}
          placeholder="+27 123 456 789"
        />
        <Textarea
          label="Bio (optional)"
          value={form.bio}
          onChange={e => handleChange("bio", e.target.value)}
          placeholder="Short description about this member"
        />
        <Checkbox
          label="Send welcome email"
          checked={form.sendEmail}
          onChange={e => handleChange("sendEmail", e.target.checked)}
        />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!form.name || !form.email || !form.phone}
          >
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
}