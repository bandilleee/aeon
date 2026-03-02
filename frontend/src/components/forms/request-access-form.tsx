"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Terminal,
  Info,
  AlertCircle,
} from "lucide-react";
import { Button, Input, Checkbox } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { requestAccessSchema, type RequestAccessFormData } from "@/lib/validations";

export function RequestAccessForm() {
  const router  = useRouter();
  const [isLoading,  setIsLoading]  = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RequestAccessFormData>({
    resolver:      zodResolver(requestAccessSchema),
    defaultValues: { firstName: "", lastName: "", email: "", reason: "", agreeToTerms: false },
    mode:          "onBlur",
  });

  const reasonValue = watch("reason", "");

  const onSubmit = async (data: RequestAccessFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const baseUrl  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5073";
      const response = await fetch(`${baseUrl}/api/auth/request-access`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          firstName: data.firstName,
          lastName:  data.lastName,
          email:     data.email,
          reason:    data.reason,
        }),
      });

      let result: any;
      try {
        result = await response.json();
      } catch {
        throw new Error("Server returned an invalid response. Is the backend running?");
      }

      if (!response.ok) {
        const msg =
          result?.error?.message ||
          result?.message ||
          "Something went wrong. Please try again.";
        throw new Error(msg);
      }

      setIsSubmitted(true);
    } catch (error: any) {
      if (error?.message?.includes("Failed to fetch") || error?.message?.includes("ERR_CONNECTION_REFUSED")) {
        setServerError("Cannot connect to the server. Please make sure the backend is running.");
      } else {
        setServerError(error?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── SUCCESS STATE ───────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="animate-fade-in text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white">
            <Terminal className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-zinc-100 font-semibold tracking-tight text-lg">AEON</span>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-3 tracking-tight">
          Request Submitted
        </h1>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Your request has been received. An admin will review it and you&apos;ll
          receive an email with the outcome — usually within 24 hours.
        </p>

        <Card className="bg-zinc-900/50 border-white/5 mb-8">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-500 text-left leading-relaxed">
                Keep an eye on your inbox. If approved, you&apos;ll receive your login
                credentials via email and can sign in immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          onClick={() => router.push("/login")}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  // ─── FORM STATE ──────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50">
          <Terminal className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <span className="text-zinc-100 font-semibold tracking-tight text-lg">AEON</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Request Access
        </h1>
        <p className="text-sm text-zinc-500">
          Fill in your details and we&apos;ll get back to you shortly.
        </p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            disabled={isLoading}
            {...register("firstName")}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            disabled={isLoading}
            {...register("lastName")}
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register("email")}
        />

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Reason for Joining
          </label>
          <textarea
            placeholder="Tell us a bit about yourself and why you'd like to join..."
            rows={4}
            disabled={isLoading}
            {...register("reason")}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none disabled:opacity-50"
          />
          <div className="flex justify-between mt-1">
            {errors.reason ? (
              <p className="text-xs text-red-400">{errors.reason.message}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-zinc-600 ml-auto">{reasonValue.length}/500</p>
          </div>
        </div>

        {/* Terms */}
        <Checkbox
          label={
            <span className="text-zinc-400">
              I agree to the{" "}
              <a href="#" className="text-zinc-300 hover:text-white underline transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-zinc-300 hover:text-white underline transition-colors">
                Privacy Policy
              </a>
            </span>
          }
          error={errors.agreeToTerms?.message}
          disabled={isLoading}
          {...register("agreeToTerms")}
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
        >
          Submit Request
        </Button>
      </form>

      {/* Back to login */}
      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}