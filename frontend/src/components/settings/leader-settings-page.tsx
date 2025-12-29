"use client";
import { useState } from "react";
import { Card, CardContent, Button, Input, Textarea, Checkbox } from "@/components/ui";
import {
  validateDisplayName,
  validateEmail,
  validatePhone,
  validatePassword,
} from "@/lib/leader-settings-validation";

// Mock current leader profile (could come from auth/session/store in production)
const mockProfile = {
  displayName: "Jane Doe",
  email: "jane@example.com",
  phone: "+27 123456789",
  bio: "Community leader.",
  avatarUrl: "",
};
const mockNotifications = {
  emailNotifications: true,
  eventNotifications: true,
  taskNotifications: false,
  memberNotifications: true,
};

export function SettingsPage() {
  // Profile
  const [profile, setProfile] = useState({ ...mockProfile });
  const [profileErrors, setProfileErrors] = useState({ displayName: "", email: "", phone: "" });
  // Security
  const [security, setSecurity] = useState({ password: "", newPassword: "", confirmPassword: "" });
  const [securityErrors, setSecurityErrors] = useState({ password: "", newPassword: "", confirmPassword: "" });
  // Notifications
  const [notifications, setNotifications] = useState({ ...mockNotifications });

  // Avatar upload placeholder
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setProfile(f => ({ ...f, avatarUrl: URL.createObjectURL(file) }));
    }
  }

  function handleProfileSave() {
    let valid = true;
    let errs = { displayName: "", email: "", phone: "" };
    if (!validateDisplayName(profile.displayName)) {
      errs.displayName = "Please enter Name & Surname (letters only).";
      valid = false;
    }
    if (!validateEmail(profile.email)) {
      errs.email = "Please enter a valid email.";
      valid = false;
    }
    if (!validatePhone(profile.phone)) {
      errs.phone = "Phone number must start with +27 and have 9 digits.";
      valid = false;
    }
    setProfileErrors(errs);
    if (!valid) return;

    // TODO: Send changes to backend
    alert("Profile saved successfully!");
  }

  function handleSecuritySave() {
    let valid = true;
    let errs = { password: "", newPassword: "", confirmPassword: "" };
    // Validate password only if changing
    if (security.newPassword || security.confirmPassword) {
      if (!validatePassword(security.newPassword)) {
        errs.newPassword = "Min 8 chars, uppercase, lowercase, digit, special char.";
        valid = false;
      }
      if (security.newPassword !== security.confirmPassword) {
        errs.confirmPassword = "Passwords don't match.";
        valid = false;
      }
      if (!security.password) {
        errs.password = "Please enter your current password.";
        valid = false;
      }
    }
    setSecurityErrors(errs);
    if (!valid) return;

    // TODO: Send changes to backend
    alert("Password updated successfully!");
    setSecurity({ password: "", newPassword: "", confirmPassword: "" });
  }

  function handleNotificationSave() {
    // TODO: Save to backend
    alert("Notification preferences saved!");
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-10">
      <Card>
        <CardContent className="pt-8 px-6 space-y-8">
          <h2 className="text-xl font-semibold text-white mb-2">Profile</h2>
          <div className="flex gap-5 flex-wrap items-center">
            <div className="flex flex-col items-center gap-2">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-20 h-20 rounded-full border border-white/10" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-400 flex items-center justify-center text-3xl text-white font-bold border border-white/10">
                  {profile.displayName.split(" ").map(n => n[0]).join("")}
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" id="avatar-upload"
                onChange={handleAvatarChange}
              />
              <Button variant="ghost" size="sm"
                onClick={() => {
                  const input = document.getElementById("avatar-upload");
                  if (input) input.click();
                }}
              >Change Avatar</Button>
            </div>
            <div className="flex-1 min-w-[180px]">
              <Input
                label="Name & Surname"
                value={profile.displayName}
                onChange={e => setProfile(f => ({ ...f, displayName: e.target.value }))}
                error={profileErrors.displayName}
                placeholder="e.g. Jane Doe"
              />
              <Input
                label="Email"
                value={profile.email}
                onChange={e => setProfile(f => ({ ...f, email: e.target.value }))}
                error={profileErrors.email}
                placeholder="e.g. jane@example.com"
              />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={e => setProfile(f => ({ ...f, phone: e.target.value }))}
                error={profileErrors.phone}
                placeholder="+27 123456789"
              />
              <Textarea
                label="Bio (optional)"
                value={profile.bio || ""}
                onChange={e => setProfile(f => ({ ...f, bio: e.target.value }))}
                placeholder="Short description about you"
              />
              <div className="flex justify-end pt-2">
                <Button onClick={handleProfileSave}>Save Profile</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-8 px-6 space-y-8">
          <h2 className="text-xl font-semibold text-white mb-2">Security</h2>
          <Input
            label="Current Password"
            value={security.password}
            onChange={e => setSecurity(f => ({ ...f, password: e.target.value }))}
            error={securityErrors.password}
            type="password"
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            value={security.newPassword}
            onChange={e => setSecurity(f => ({ ...f, newPassword: e.target.value }))}
            error={securityErrors.newPassword}
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 chars, uppercase, lowercase, digit, special char"
          />
          <Input
            label="Confirm New Password"
            value={security.confirmPassword}
            onChange={e => setSecurity(f => ({ ...f, confirmPassword: e.target.value }))}
            error={securityErrors.confirmPassword}
            type="password"
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleSecuritySave}>Update Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-8 px-6 space-y-8">
          <h2 className="text-xl font-semibold text-white mb-2">Notifications</h2>
          <Checkbox
            label="Receive all email notifications"
            checked={notifications.emailNotifications}
            onChange={e => setNotifications(f => ({ ...f, emailNotifications: e.target.checked }))}
          />
          <Checkbox
            label="Event notifications"
            checked={notifications.eventNotifications}
            onChange={e => setNotifications(f => ({ ...f, eventNotifications: e.target.checked }))}
          />
          <Checkbox
            label="Task notifications"
            checked={notifications.taskNotifications}
            onChange={e => setNotifications(f => ({ ...f, taskNotifications: e.target.checked }))}
          />
          <Checkbox
            label="Member activity notifications"
            checked={notifications.memberNotifications}
            onChange={e => setNotifications(f => ({ ...f, memberNotifications: e.target.checked }))}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleNotificationSave}>Save Notifications</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}