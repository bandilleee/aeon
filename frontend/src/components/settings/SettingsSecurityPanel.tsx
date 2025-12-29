"use client";
import { useState } from "react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { Lock, ShieldCheck, KeyRound } from "lucide-react";
import { validatePassword } from "@/lib/leader-settings-validation";

export default function SettingsSecurityPanel() {
  const [security, setSecurity] = useState({ password: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ password: "", newPassword: "", confirmPassword: "" });
  const [success, setSuccess] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  const [twofaEnabled, setTwofaEnabled] = useState(false);

  function handlePasswordChange() {
    let errs = { password: "", newPassword: "", confirmPassword: ""};
    let valid = true;
    if (!security.password) { errs.password="Current password required."; valid = false; }
    if (!validatePassword(security.newPassword)) {
      errs.newPassword="Password must be 8+ chars, upper/lower, number, special char."; valid = false;
    }
    if (security.newPassword !== security.confirmPassword) {
      errs.confirmPassword="Passwords do not match."; valid = false;
    }
    setErrors(errs);
    if (!valid) return;
    setSuccess(true); setTimeout(() => setSuccess(false), 1500);
    setSecurity({ password: "", newPassword: "", confirmPassword: "" });
  }

  function handleToggle2FA() {
    setUpdating2FA(true);
    setTimeout(() => {
      setTwofaEnabled(val => !val);
      setUpdating2FA(false);
    }, 1000);
  }

  return (
    <Card className="bg-zinc-900/80 border border-zinc-700 shadow-lg rounded-2xl">
      <CardContent className="py-10 px-8 flex flex-col gap-10">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5" /> Change Password
          </h2>
          <Input
            label="Current Password"
            type="password"
            value={security.password}
            onChange={e => setSecurity(f => ({ ...f, password: e.target.value }))}
            error={errors.password}
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            type="password"
            value={security.newPassword}
            onChange={e => setSecurity(f => ({ ...f, newPassword: e.target.value }))}
            error={errors.newPassword}
            autoComplete="new-password"
            placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={security.confirmPassword}
            onChange={e => setSecurity(f => ({ ...f, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <div className="flex justify-end pt-3">
            <Button isLoading={false} onClick={handlePasswordChange}>Update Password</Button>
          </div>
          {success && <p className="text-green-400 mt-2 text-sm">Password changed!</p>}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5" /> Two-Factor Authentication
          </h2>
          <div className="bg-zinc-800 border border-blue-900/40 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col flex-1 min-w-[12rem]">
              <p className="text-base text-zinc-300 mb-2">
                {twofaEnabled
                  ? "Your account is protected with 2FA (Authenticator app required)."
                  : "Your account is not protected with 2FA."}
              </p>
              <p className="text-sm text-zinc-500">
                Use an app like Google Authenticator or Authy. (Demo: enable/disable only)
              </p>
              {twofaEnabled && (
                <p className="text-emerald-400 mt-2 text-sm flex items-center gap-2">
                  <KeyRound className="h-4 w-4" /> 2FA ON
                </p>
              )}
              {!twofaEnabled && (
                <p className="text-orange-400 mt-2 text-sm">
                  2FA is OFF. Enable for maximum protection.
                </p>
              )}
            </div>
            <Button
              variant={twofaEnabled ? "danger" : "secondary"}
              isLoading={updating2FA}
              onClick={handleToggle2FA}
              className="min-w-[120px]"
              type="button"
            >
              {twofaEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}