"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { AdminUser, SystemRole } from "@/types/admin-user.types";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user: AdminUser;
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "community_leader", label:  "Community Leader" },
  { value:  "moderator", label: "Moderator" },
  { value: "viewer", label: "Viewer" },
];

export function EditUserModal({ isOpen, onClose, onSubmit, user }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "",
    role:  user.role,
    notes: user.notes || "",
    tags:  user.tags?. join(", ") || "",
  });

  useEffect(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone:  user.phone || "",
      role: user.role,
      notes: user.notes || "",
      tags: user.tags?. join(", ") || "",
    });
  }, [user]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        tags:  formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* User Info Header */}
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-violet-400 flex items-center justify-center text-lg text-white font-bold">
            {user.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{user.displayName}</p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                className="w-full bg-zinc-900/50 border border-white/10 text-sm text-zinc-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
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
          <h3 className="text-sm font-medium text-zinc-400">Role</h3>
          <Select
            label="Role"
            placeholder="Select a role"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData((prev) => ({ ...prev, role: value as SystemRole }))}
          />
          <p className="text-xs text-zinc-500">
            Changing the role will reset permissions to role defaults unless custom permissions are set. 
          </p>
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
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
}