"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { Lock, ShieldCheck, KeyRound, CheckCircle, Save, Smartphone, Loader2 } from "lucide-react";
import { validatePassword } from "@/lib/leader-settings-validation";
import { settingsService } from "@/services/settings.service";
import { useAuth } from '@/contexts/auth-context';

export default function SettingsSecurityPanel() {
  const { user } = useAuth();
  const currentUserId = user?.id || "user_1";

  const [security, setSecurity] = useState({ password: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ password: "", newPassword: "", confirmPassword: "" });
  const [success, setSuccess] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [updating2FA, setUpdating2FA] = useState(false);
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const response = await settingsService.getSettings(currentUserId);
        if (response.success && response.data) {
          setTwofaEnabled(response.data.twoFactorEnabled);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [currentUserId]);

  async function handlePasswordChange() {
    let errs = { password: "", newPassword: "", confirmPassword: "" };
    let valid = true;

    if (!security.password) { errs.password = "Current password is required."; valid = false; }
    if (!validatePassword(security.newPassword)) { errs.newPassword = "Must be 8+ chars, contain an uppercase, lowercase, number, and symbol."; valid = false; }
    if (!security.newPassword) { errs.newPassword = "New password is required."; valid = false; }
    if (security.newPassword !== security.confirmPassword) { errs.confirmPassword = "Passwords do not match."; valid = false; }

    setErrors(errs);
    if (!valid) return;

    try {
      setIsSubmitting(true);
      const response = await settingsService.changePassword(currentUserId, {
        currentPassword: security.password,
        newPassword: security.newPassword
      });
      
      if (response.success) {
        setSuccess(true); 
        setSecurity({ password: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle2FA() {
    try {
      setUpdating2FA(true);
      const newState = !twofaEnabled;
      const response = await settingsService.toggle2FA(currentUserId, newState);
      
      if (response.success) {
        setTwofaEnabled(newState);
      }
    } finally {
      setUpdating2FA(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-zinc-500" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-2xl space-y-6">
            <Input
              label="Current Password"
              type="password"
              value={security.password}
              onChange={e => setSecurity(f => ({ ...f, password: e.target.value }))}
              error={errors.password}
              autoComplete="current-password"
              placeholder="Enter your current password"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="New Password"
                type="password"
                value={security.newPassword}
                onChange={e => setSecurity(f => ({ ...f, newPassword: e.target.value }))}
                error={errors.newPassword}
                autoComplete="new-password"
                placeholder="Min 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={security.confirmPassword}
                onChange={e => setSecurity(f => ({ ...f, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                {success && (
                  <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle className="h-4 w-4" /> Password updated successfully
                  </p>
                )}
              </div>
              <Button 
                isLoading={isSubmitting} 
                onClick={handlePasswordChange}
                leftIcon={<Save className="h-4 w-4" />}
                className="min-w-[170px]"
              >
                Update Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-zinc-500" /> Two-Factor Authentication (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full border ${twofaEnabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                {twofaEnabled ? <KeyRound className="h-6 w-6 text-emerald-400" /> : <Smartphone className="h-6 w-6 text-zinc-400" />}
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-medium text-zinc-200 mb-1">
                  {twofaEnabled ? "2FA is currently enabled" : "Secure your account with 2FA"}
                </h3>
                <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
                  Two-factor authentication adds an extra layer of security to your account. You'll need to use an authenticator app (like Google Authenticator or Authy) to log in.
                </p>
                {twofaEnabled && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium w-max">
                    <CheckCircle className="h-3 w-3" /> Active and protecting your account
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto flex justify-end shrink-0">
              <Button
                variant={twofaEnabled ? "secondary" : "default"}
                isLoading={updating2FA}
                onClick={handleToggle2FA}
                className={twofaEnabled ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20" : ""}
              >
                {twofaEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}