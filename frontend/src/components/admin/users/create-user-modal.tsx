"use client";

import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { SystemRole } from "@/types/admin-user.types";
import { cn } from "@/lib/utils";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const roleOptions = [
  { value: "community_leader", label: "Community Leader" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
  { value: "viewer", label: "Viewer" },
];

export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "community_leader" as SystemRole,
    sendInvite: true,
    temporaryPassword: "",
    mustChangePassword: true,
    notes: "",
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "community_leader",
      sendInvite: true,
      temporaryPassword: "",
      mustChangePassword: true,
      notes: "",
      tags: "",
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.sendInvite && !formData.temporaryPassword.trim()) {
      newErrors.temporaryPassword = "Password is required when not sending invite";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      resetForm();
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New User" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                className={cn(
                  "w-full bg-zinc-900/50 border text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 transition-all placeholder:text-zinc-600",
                  errors.firstName ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-white/20"
                )}
                placeholder="John"
              />
              {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                className={cn(
                  "w-full bg-zinc-900/50 border text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 transition-all placeholder:text-zinc-600",
                  errors.lastName ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-white/20"
                )}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className={cn(
                "w-full bg-zinc-900/50 border text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 transition-all placeholder:text-zinc-600",
                errors.email ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-white/20"
              )}
              placeholder="john.doe@example.com"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-zinc-600"
              placeholder="+27 82 123 4567"
            />
          </div>
        </div>
        
        {/* Role */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Role & Permissions</h3>
          <Select
            label="Role"
            placeholder="Select a role"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData((prev) => ({ ...prev, role: value as SystemRole }))}
          />
          <p className="text-xs text-zinc-500">
            The selected role determines the default permissions for this user. 
          </p>
        </div>

        {/* Invite Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Account Setup</h3>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-sm text-zinc-200">Send email invitation</p>
              <p className="text-xs text-zinc-500">User will receive a link to set their password</p>
            </div>
            
            {/* FIXED TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, sendInvite: !prev.sendInvite }))}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                formData.sendInvite ? "bg-emerald-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                  formData.sendInvite ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
          
          {!formData.sendInvite && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Temporary Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.temporaryPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, temporaryPassword: e.target.value }))}
                  className={cn(
                    "w-full bg-zinc-900/50 border text-sm text-zinc-300 rounded-md px-3 py-2.5 pr-10 focus:outline-none focus:ring-1 transition-all",
                    errors.temporaryPassword ? "border-red-500 focus:ring-red-500" : "border-white/10 focus:ring-white/20"
                  )}
                  placeholder="Enter temporary password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.temporaryPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.temporaryPassword}</p>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-sm text-zinc-200">Require password change</p>
              <p className="text-xs text-zinc-500">User must set a new password on first login</p>
            </div>
            
            {/* FIXED TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, mustChangePassword: !prev.mustChangePassword }))}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                formData.mustChangePassword ? "bg-emerald-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                  formData.mustChangePassword ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* Notes & Tags */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Additional Info</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder:text-zinc-600"
              placeholder="Internal notes about this user..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-zinc-600"
              placeholder="e.g., senior, verified, external (comma separated)"
            />
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
        <Button variant="secondary" className="flex-1" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Create User
        </Button>
      </div>
    </Modal>
  );
}