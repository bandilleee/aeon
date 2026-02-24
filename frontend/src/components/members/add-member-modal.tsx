"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Button, Textarea, Checkbox } from "@/components/ui";

function validateName(name: string) {
  // Must be at least two words, allows letters, spaces, hyphens, and apostrophes
  return /^[A-Za-z\-']+\s+[A-Za-z\-']*(\s*[A-Za-z\-']*)*$/.test(name.trim());
}

function validateEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  
  // 1. Basic structural check (must have @ and .)
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(cleanEmail)) return false;

  // 2. Extract the domain part (everything after the @)
  const parts = cleanEmail.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];

  // 3. Catch common Top-Level Domain (TLD) typos
  const tld = domain.split('.').pop();
  const invalidTlds = ['comm', 'con', 'coom', 'cmo', 'netr', 'orgg', 'zaa'];
  if (tld && invalidTlds.includes(tld)) return false;

  // 4. Catch common provider typos (people typing too fast)
  const knownDomainTypos = [
    'gmial.com', 'gmil.com', 'gamil.com', 'gmal.com', 'gmail.co.za', // Gmail is strictly .com
    'yaho.com', 'yahoo.coom',
    'hotmial.com', 'hotmil.com',
    'outlok.com'
  ];
  if (knownDomainTypos.includes(domain)) return false;

  return true;
}

function validatePhone(phone: string) {
  // Checks if it exactly matches our auto-formatted length: +27 XX XXX XXXX (15 characters)
  return phone.length === 15;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: { name: string; email: string; bio: string; phone: string; sendEmail: boolean; status: string }) => Promise<void>;
}

export function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "", 
    sendEmail: true,
  });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });

  function handleChange(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear the error as soon as they start typing again
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  /**
   * Smart Phone Formatter
   * Automatically adds +27, spaces, and limits length!
   */
  function handlePhoneChange(value: string) {
    let digits = value.replace(/\D/g, "");

    // If they type a local number starting with 0, swap the 0 for 27
    if (digits.startsWith("0")) {
      digits = "27" + digits.substring(1);
    } 
    // Force it to always start with 27
    else if (!digits.startsWith("27") && digits.length > 0) {
      digits = "27" + digits;
    }

    // Limit to exactly 11 digits (27 + 9 local digits)
    digits = digits.substring(0, 11);

    // Build the formatted string (+27 XX XXX XXXX)
    let formatted = "";
    if (digits.length > 0) formatted = "+" + digits.substring(0, 2); 
    if (digits.length > 2) formatted += " " + digits.substring(2, 4); 
    if (digits.length > 4) formatted += " " + digits.substring(4, 7); 
    if (digits.length > 7) formatted += " " + digits.substring(7, 11); 

    setErrors((e) => ({ ...e, phone: "" }));
    setForm((f) => ({ ...f, phone: formatted }));
  }

  async function handleSubmit() {
    let valid = true;
    let errs = { name: "", email: "", phone: "" };

    if (!validateName(form.name)) {
      errs.name = "Please enter both a name and surname.";
      valid = false;
    }
    if (!validateEmail(form.email)) {
      errs.email = "Please enter a valid email address (check for typos).";
      valid = false;
    }
    if (!validatePhone(form.phone)) {
      errs.phone = "Please enter a full 9-digit South African number.";
      valid = false;
    }

    setErrors(errs);
    if (!valid) return;

    try {
      setIsSubmitting(true);
      
      // Auto-trim the email before sending it to the database
      const cleanData = {
        ...form,
        email: form.email.trim().toLowerCase(),
        status: "active"
      };

      await onAdd(cleanData);
      
      setForm({ name: "", email: "", bio: "", phone: "", sendEmail: true });
      onClose();
    } catch (error) {
      console.error("Failed to add member", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Member" size="sm">
      <div className="space-y-4">
        <Input
          label="Name & Surname"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
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
          value={form.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          error={errors.phone}
          placeholder="+27 82 123 4567"
          disabled={isSubmitting}
        />
        <Textarea
          label="Bio (optional)"
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Short description about this member"
          disabled={isSubmitting}
        />
        <Checkbox
          label="Send welcome email"
          checked={form.sendEmail}
          onChange={(e) => handleChange("sendEmail", e.target.checked)}
          disabled={isSubmitting}
        />
        <div className="flex gap-2 justify-end pt-2 border-t border-white/5 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!form.name || !form.email || !form.phone}
          >
            Add Member
          </Button>
        </div>
      </div>
    </Modal>
  );
}