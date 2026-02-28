"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Mail, ArrowRight, ArrowLeft, Terminal, Send, CheckCircle, Clock } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/services/auth.service"; // <-- Bridge!

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ... keep the exact same JSX return logic below ...
  if (isSubmitted) {
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
              <Send className="h-7 w-7 text-emerald-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-black" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-sm text-zinc-500">
            We sent a password reset link to
          </p>
          <p className="text-sm text-zinc-300 font-medium mt-1">
            {submittedEmail}
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-zinc-400">1</span>
                </div>
                <p className="text-sm text-zinc-400">
                  Open the email from <span className="text-zinc-300">noreply@aeon.com</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-zinc-400">2</span>
                </div>
                <p className="text-sm text-zinc-400">
                  Click the "Reset Password" button in the email
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-zinc-400">3</span>
                </div>
                <p className="text-sm text-zinc-400">
                  Create a new secure password
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiry Warning */}
        <div className="mb-6 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-center gap-3">
          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-400/80">
            This link will expire in <span className="font-medium text-amber-400">1 hour</span> for security reasons. 
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={() => router.push("/login")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to sign in
          </Button>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSubmittedEmail("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-center text-xs text-zinc-600">
          Check your spam folder if you don't see the email.{" "}
          <a href="#" className="text-zinc-500 hover:text-zinc-400 transition-colors">
            Contact support
          </a>
        </p>
      </div>
    );
  }

  // Form State
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
          Forgot password? 
        </h1>
        <p className="text-sm text-zinc-500">
          No worries, we'll send you reset instructions. 
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register("email")}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
        >
          Send reset link
        </Button>
      </form>

      {/* Back to Login */}
      <div className="mt-8">
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
        Remember your password? {" "}
        <button
          onClick={() => router.push("/login")}
          className="text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}