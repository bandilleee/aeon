"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  ArrowRight, 
  Terminal, 
  CheckCircle, 
  AlertCircle,
  Shield 
} from "lucide-react";
import { z } from "zod";

import { Button, PasswordInput } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Password requirements schema
 */
const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

/**
 * Password requirement checker component
 */
function PasswordRequirement({ 
  met, 
  text 
}: { 
  met: boolean; 
  text: string; 
}) {
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

export function SetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange", // Validate as user types for live feedback
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

  const onSubmit = async (data: SetPasswordFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      // TODO: Replace with actual API call to your C# backend
      console.log("New password data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to dashboard after successful password change
      router.push("/dashboard");
    } catch (error) {
      setServerError("Failed to set password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          Set Your Password
        </h1>
        <p className="text-sm text-zinc-500">
          Create a secure password for your account
        </p>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-3">
        <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-amber-400/90 font-medium mb-1">
            First-time login detected
          </p>
          <p className="text-xs text-amber-400/70">
            You're using a temporary password. Please create a new secure password to continue.
          </p>
        </div>
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
                <PasswordRequirement
                  met={requirements.number}
                  text="Number"
                />
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
          Set Password & Continue
        </Button>
      </form>

      {/* Security Note */}
      <p className="mt-8 text-center text-xs text-zinc-600">
        Your password is encrypted and securely stored. {" "}
        <a href="#" className="text-zinc-500 hover:text-zinc-400 transition-colors">
          Learn about our security
        </a>
      </p>
    </div>
  );
}