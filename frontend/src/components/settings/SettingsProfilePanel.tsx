"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea } from "@/components/ui";
import { User, Mail, Camera, Save, CheckCircle, Loader2 } from "lucide-react";
import { settingsService } from "@/services/settings.service";
import { useAuth } from '@/contexts/auth-context';

// --- SMART VALIDATORS ---
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
    'yaho.com', 'yahoo.coom', 'hotmial.com', 'hotmil.com', 'outlok.com'
  ];
  if (knownDomainTypos.includes(domain)) return false;

  return true;
}

function validatePhone(phone: string) {
  return phone.length === 15;
}

export default function SettingsProfilePanel() {
  const { user } = useAuth();
  const currentUserId = user?.id || "user_1"; // Safe fallback

  const [profile, setProfile] = useState({ displayName: "", email: "", phone: "", bio: "", avatarUrl: "" });
  const [errors, setErrors] = useState({ displayName: "", email: "", phone: "" });
  
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- FETCH REAL SETTINGS ---
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const response = await settingsService.getSettings(currentUserId);
        if (response.success && response.data) {
          setProfile({
            displayName: response.data.displayName || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            bio: response.data.bio || "",
            avatarUrl: response.data.avatarUrl || ""
          });
        }
      } catch (error) {
        console.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [currentUserId]);

  function handleChange(field: string, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handlePhoneChange(value: string) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "27" + digits.substring(1);
    else if (!digits.startsWith("27") && digits.length > 0) digits = "27" + digits;
    digits = digits.substring(0, 11);

    let formatted = "";
    if (digits.length > 0) formatted = "+" + digits.substring(0, 2);
    if (digits.length > 2) formatted += " " + digits.substring(2, 4);
    if (digits.length > 4) formatted += " " + digits.substring(4, 7);
    if (digits.length > 7) formatted += " " + digits.substring(7, 11);

    setErrors((prev) => ({ ...prev, phone: "" }));
    setProfile((prev) => ({ ...prev, phone: formatted }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) setProfile((f) => ({ ...f, avatarUrl: URL.createObjectURL(file) }));
  }

  async function handleSave() {
    let errs = { displayName: "", email: "", phone: "" };
    let valid = true;

    if (!validateName(profile.displayName)) { errs.displayName = "Please enter both a name and surname."; valid = false; }
    if (!validateEmail(profile.email)) { errs.email = "Please enter a valid email address."; valid = false; }
    if (!validatePhone(profile.phone)) { errs.phone = "Please enter a full 9-digit South African number."; valid = false; }

    setErrors(errs);
    if (!valid) return;

    try {
      setSaving(true);
      const response = await settingsService.updateProfile(currentUserId, profile);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to save profile");
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-zinc-500" /> Public Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center relative group">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} className="object-cover w-full h-full" alt="avatar" />
                ) : (
                  <User className="h-10 w-10 text-zinc-600" />
                )}
                
                <div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer"
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                >
                  <Camera className="h-5 w-5 text-white mb-1" />
                  <span className="text-[10px] font-medium text-white uppercase tracking-wider">Change</span>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 space-y-6 w-full">
              <Input
                label="Display Name"
                value={profile.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                error={errors.displayName}
                placeholder="Jane Doe"
              />
              <Textarea
                label="Bio"
                value={profile.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Briefly describe your role or background..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-zinc-500" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              placeholder="jane@example.com"
            />
            <Input
              label="Phone Number"
              value={profile.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              error={errors.phone}
              placeholder="+27 82 123 4567"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <div>
          {success && (
            <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="h-4 w-4" /> Profile updated successfully
            </p>
          )}
        </div>
        <Button 
          isLoading={saving} 
          onClick={handleSave} 
          leftIcon={<Save className="h-4 w-4" />}
          className="min-w-[140px]"
        >
          Save Changes
        </Button>
      </div>

    </div>
  );
}