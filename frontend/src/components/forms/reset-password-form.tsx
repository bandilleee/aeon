"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import {
  ArrowRight,
  ArrowLeft,
  Terminal,
  CheckCircle,
  AlertCircle,
  XCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { Button, PasswordInput } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { strongPasswordSchema } from "@/lib/validations";

/**
 * Reset password schema
 */
const resetPasswordSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Token status types
 */
type TokenStatus = "loading" | "valid" | "invalid" | "expired";

/**
 * Password requirement checker
 */
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border border-zinc-700" />
      )}
      <span className={`text-xs ${met ? "text-zinc-300" : "text-zinc-600"}`}>
        {text}
      </span>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("loading");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Watch password for live requirement checking
  const password = watch("newPassword", "");

  // Check each requirement
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allRequirementsMet = Object.values(requirements).every(Boolean);

  /**
   * Verify token on mount
   */
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        return;
      }

      try {
        // TODO: Replace with actual API call to verify token
        console.log("Verifying token:", token);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock token verification
        // In real app, backend checks if token exists and is not expired
        if (token === "expired") {
          setTokenStatus("expired");
        } else if (token === "invalid") {
          setTokenStatus("invalid");
        } else {
          setTokenStatus("valid");
        }
      } catch (error) {
        setTokenStatus("invalid");
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      // TODO: Replace with actual API call to your C# backend
      console.log("Reset password:", { token, ...data });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (error) {
      setServerError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading State
  if (tokenStatus === "loading") {
    return (
      <div className="animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
            <Terminal className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-zinc-100 font-semibold tracking-tight text-lg">
            AEON
          </span>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 border border-white/10 rounded-full mb-4 animate-pulse">
            <Lock className="h-5 w-5 text-zinc-500" />
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight mb-2">
            Verifying reset link... 
          </h1>
          <p className="text-sm text-zinc-500">
            Please wait while we verify your reset token. 
          </p>
        </div>
      </div>
    );
  }

  // Invalid Token State
  if (tokenStatus === "invalid") {
    return (
      <div className="animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
            <Terminal className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-zinc-100 font-semibold tracking-tight text-lg">
            AEON
          </span>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            Invalid reset link
          </h1>
          <p className="text-sm text-zinc-500">
            This password reset link is invalid or has already been used.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-400">
              Password reset links can only be used once. If you need to reset your
              password, please request a new link.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push("/forgot-password")}
          >
            Request new link
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/login")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  // Expired Token State
  if (tokenStatus === "expired") {
    return (
      <div className="animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
            <Terminal className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-zinc-100 font-semibold tracking-tight text-lg">
            AEON
          </span>
        </div>

        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            Link expired
          </h1>
          <p className="text-sm text-zinc-500">
            This password reset link has expired for security reasons.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-400">
              Password reset links expire after <span className="text-zinc-300">1 hour</span> to
              protect your account. Please request a new link to continue.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push("/forgot-password")}
          >
            Request new link
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/login")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
            <Terminal className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-zinc-100 font-semibold tracking-tight text-lg">
            AEON
          </span>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-black" />
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            Password reset successful
          </h1>
          <p className="text-sm text-zinc-500">
            Your password has been successfully reset. You can now sign in with your new password. 
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push("/login")}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Continue to sign in
        </Button>

        <p className="mt-8 text-center text-xs text-zinc-600">
          For security, you've been logged out of all devices. 
        </p>
      </div>
    );
  }

  // Reset Password Form State
  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
          <Terminal className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="text-zinc-100 font-semibold tracking-tight text-lg">
          AEON
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-zinc-500">
          Create a new secure password for your account
        </p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* New Password */}
        <div>
          <PasswordInput
            label="New Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            disabled={isLoading}
            {...register("newPassword")}
          />

          {/* Password Requirements */}
          <Card className="mt-3 bg-zinc-900/50">
            <CardContent className="p-3">
              <p className="text-xs text-zinc-500 mb-2 font-medium">
                Password requirements: 
              </p>
              <div className="grid grid-cols-2 gap-2">
                <PasswordRequirement
                  met={requirements.length}
                  text="8+ characters"
                />
                <PasswordRequirement
                  met={requirements.uppercase}
                  text="Uppercase letter"
                />
                <PasswordRequirement
                  met={requirements.lowercase}
                  text="Lowercase letter"
                />
                <PasswordRequirement met={requirements.number} text="Number" />
                <PasswordRequirement
                  met={requirements.special}
                  text="Special character"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          {...register("confirmPassword")}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          disabled={!allRequirementsMet}
          rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
        >
          Reset password
        </Button>
      </form>

      {/* Back to Login */}
      <div className="mt-6">
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/login")}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to sign in
        </Button>
      </div>

      {/* Security Note */}
      <p className="mt-8 text-center text-xs text-zinc-600">
        After resetting, you'll be logged out of all other devices. 
      </p>
    </div>
  );
}