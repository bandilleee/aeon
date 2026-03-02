"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowRight, Terminal, CheckCircle, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { z } from "zod";
import { Button, Input, Label } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";

// ── Schema ────────────────────────────────────────────────────────────────────
const setPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current (temporary) password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

// ── Requirement indicator ─────────────────────────────────────────────────────
function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? "text-emerald-400" : "text-zinc-500"}`}>
      <CheckCircle className={`h-3 w-3 ${met ? "opacity-100" : "opacity-30"}`} />
      {label}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SetPasswordForm() {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
  });

  const newPw = watch("newPassword") ?? "";
  const requirements = [
    { met: newPw.length >= 8,            label: "At least 8 characters" },
    { met: /[A-Z]/.test(newPw),          label: "One uppercase letter" },
    { met: /[a-z]/.test(newPw),          label: "One lowercase letter" },
    { met: /[0-9]/.test(newPw),          label: "One number" },
    { met: /[^A-Za-z0-9]/.test(newPw),  label: "One special character" },
  ];

  const onSubmit = async (data: SetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("aeon_access_token");
      if (!token) {
        setError("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      // Call the AuthController change-password endpoint
      const response = await fetch("http://localhost:5073/api/auth/change-password", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword:     data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "Failed to change password. Please try again.");
        return;
      }

      // Update the stored user so mustChangePassword is cleared in memory
      const storedUser = localStorage.getItem("aeon_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.mustChangePassword = false;
        localStorage.setItem("aeon_user", JSON.stringify(parsed));
      }

      // Redirect to 2FA prompt (first login flow continues)
      router.push("/setup-2fa");

    } catch (err: any) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center">
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">AEON</span>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Lock className="h-4 w-4 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Set Your Password</h1>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            Welcome, {user?.firstName ?? "there"}! Your account is almost ready.
            Please set a permanent password to continue.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-5">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current (temp) password */}
            <div>
              <Label htmlFor="currentPassword">Temporary Password</Label>
              <div className="relative mt-1">
                <input
                  {...register("currentPassword")}
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter your temporary password"
                  autoComplete="current-password"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New password */}
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <input
                  {...register("newPassword")}
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.newPassword.message}</p>
              )}
              {/* Requirements */}
              <div className="mt-2 grid grid-cols-2 gap-1">
                {requirements.map((r) => (
                  <PasswordRequirement key={r.label} met={r.met} label={r.label} />
                ))}
              </div>
            </div>

            {/* Confirm */}
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Set Password & Continue
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Aeon Community Platform &mdash; Secured with JWT
        </p>
      </div>
    </div>
  );
}