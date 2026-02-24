"use client";
import { useState, useEffect } from "react";
import { Member } from "@/types/member.types";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea, Button, Select } from "@/components/ui";

function validateName(name: string) {
  return /^[A-Za-z\-']+\s+[A-Za-z\-']*(\s*[A-Za-z\-']*)*$/.test(name.trim());
}

function validateEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(cleanEmail)) return false;

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];

  const tld = domain.split('.').pop();
  const invalidTlds = ['comm', 'con', 'coom', 'cmo', 'netr', 'orgg', 'zaa'];
  if (tld && invalidTlds.includes(tld)) return false;

  const knownDomainTypos = [
    'gmial.com', 'gmil.com', 'gamil.com', 'gmal.com', 'gmail.co.za',
    'yaho.com', 'yahoo.coom',
    'hotmial.com', 'hotmil.com',
    'outlok.com'
  ];
  if (knownDomainTypos.includes(domain)) return false;

  return true;
}

function validatePhone(phone: string) {
  return phone.length === 15;
}

interface EditMemberModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  // Updated to expect a Promise for the loading state!
  onSave: (member: Member) => Promise<void>; 
}

export function EditMemberModal({ member, isOpen, onClose, onSave }: EditMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<Member>({ ...member });
  const [errors, setErrors] = useState({ displayName: "", email: "", phone: "" });

  // Reset form when the selected member changes or modal opens
  useEffect(() => {
    setForm({ ...member });
    setErrors({ displayName: "", email: "", phone: "" });
    setIsSubmitting(false);
  }, [member, isOpen]);

  function handleChange(field: keyof Member, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function handlePhoneChange(value: string) {
    let digits = value.replace(/\D/g, "");

    if (digits.startsWith("0")) {
      digits = "27" + digits.substring(1);
    } else if (!digits.startsWith("27") && digits.length > 0) {
      digits = "27" + digits;
    }

    digits = digits.substring(0, 11);

    let formatted = "";
    if (digits.length > 0) formatted = "+" + digits.substring(0, 2);
    if (digits.length > 2) formatted += " " + digits.substring(2, 4);
    if (digits.length > 4) formatted += " " + digits.substring(4, 7);
    if (digits.length > 7) formatted += " " + digits.substring(7, 11);

    setErrors((e) => ({ ...e, phone: "" }));
    setForm((f) => ({ ...f, phone: formatted }));
  }

  async function handleSave() {
    let valid = true;
    let errs = { displayName: "", email: "", phone: "" };

    if (!validateName(form.displayName)) {
      errs.displayName = "Please enter both a name and surname.";
      valid = false;
    }
    if (!validateEmail(form.email)) {
      errs.email = "Please enter a valid email address (check for typos).";
      valid = false;
    }
    if (!validatePhone(form.phone || "")) {
      errs.phone = "Please enter a full 9-digit South African number.";
      valid = false;
    }
    setErrors(errs);
    if (!valid) return;

    try {
      setIsSubmitting(true);
      const cleanData = {
        ...form,
        email: form.email.trim().toLowerCase(),
      };
      
      await onSave(cleanData);
      // We don't call onClose() here because the parent component handles closing it on success!
    } catch (error) {
      console.error("Failed to update member", error);
    } finally {
      setIsSubmitting(false);
    }
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
          onChange={(e) => handleChange("displayName", e.target.value)}
          error={errors.displayName}
          placeholder="e.g. Jane Doe"
          disabled={isSubmitting}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          placeholder="e.g. jane@example.com"
          disabled={isSubmitting}
        />
        <Input
          label="Phone Number"
          value={form.phone || ""}
          onChange={(e) => handlePhoneChange(e.target.value)}
          error={errors.phone}
          placeholder="+27 82 123 4567"
          disabled={isSubmitting}
        />
        <Textarea
          label="Bio (optional)"
          value={form.bio || ""}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Short description about this member"
          disabled={isSubmitting}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={form.status}
          onChange={(val: string) => setForm((f: Member) => ({ ...f, status: val as Member["status"] }))}
          disabled={isSubmitting}
        />
        <div className="flex gap-2 justify-end pt-2 border-t border-white/5 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isSubmitting}
            disabled={!form.displayName || !form.email || !form.phone}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}