"use client";
import { useState } from "react";
import { Card, CardContent, Button, Input, Textarea } from "@/components/ui";
import { User } from "lucide-react";
import { validateDisplayName, validateEmail, validatePhone } from "@/lib/leader-settings-validation";

const INIT_PROFILE = {
  displayName: "Jane Doe",
  email: "jane@example.com",
  phone: "+27 123456789",
  bio: "Community leader.",
  avatarUrl: "",
};

export default function SettingsProfilePanel() {
  const [profile, setProfile] = useState({ ...INIT_PROFILE });
  const [errors, setErrors] = useState({ displayName: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) setProfile(f => ({ ...f, avatarUrl: URL.createObjectURL(file) }));
  }
  function handleSave() {
    let errs = { displayName: "", email: "", phone: "" };
    let valid = true;
    if (!validateDisplayName(profile.displayName)) {
      errs.displayName = "Full name required (name & surname, letter only)";
      valid = false;
    }
    if (!validateEmail(profile.email)) {
      errs.email = "Valid email required.";
      valid = false;
    }
    if (!validatePhone(profile.phone)) {
      errs.phone = "Must start with +27 and include 9 digits.";
      valid = false;
    }
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    }, 1000);
  }

  return (
    <Card className="bg-zinc-900/80 border border-zinc-700 shadow-lg rounded-2xl">
      <CardContent className="py-10 px-8 flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-zinc-700 to-zinc-900 border-2 border-blue-800 flex items-center justify-center text-white font-bold">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} className="object-cover w-full h-full" alt="avatar" />
            ) : (
              <User className="h-16 w-16 text-zinc-600" />
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" id="avatar-upload"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            Change Avatar
          </Button>
        </div>
        <div className="flex-1 space-y-5">
          <Input
            label="Full Name"
            value={profile.displayName}
            onChange={e => setProfile(f => ({ ...f, displayName: e.target.value }))}
            error={errors.displayName}
            placeholder="Your full name"
          />
          <Input
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={e => setProfile(f => ({ ...f, email: e.target.value }))}
            error={errors.email}
            placeholder="you@email.com"
          />
          <Input
            label="Phone Number"
            value={profile.phone}
            onChange={e => setProfile(f => ({ ...f, phone: e.target.value }))}
            error={errors.phone}
            placeholder="+27 XXX XXX XXX"
          />
          <Textarea
            label="Short Bio"
            value={profile.bio}
            onChange={e => setProfile(f => ({ ...f, bio: e.target.value }))}
            placeholder="Describe yourself in a few lines."
          />
          <div className="flex justify-end gap-4">
            <Button isLoading={saving} onClick={handleSave}>
              Save Profile
            </Button>
          </div>
          {success && <p className="text-green-400 mt-2">Profile updated!</p>}
        </div>
      </CardContent>
    </Card>
  );
}