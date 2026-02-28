"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, ArrowRight, ArrowLeft, CheckCircle, Terminal, Info } from "lucide-react";
import { Button, Input, Checkbox } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { requestAccessSchema, type RequestAccessFormData } from "@/lib/validations";
import { authService } from "@/services/auth.service"; // <-- Bridge!

export function RequestAccessForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RequestAccessFormData>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues:  { firstName: "", lastName: "", email: "", reason: "", agreeToTerms: false },
    mode: "onBlur",
  });

  const reasonValue = watch("reason", "");

  const onSubmit = async (data: RequestAccessFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      // Call our real C# backend endpoint
      await authService.requestAccess({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        reason: data.reason
      });

      setIsSubmitted(true);
    } catch (error) {
      setServerError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ... keep the rest of your EXACT SAME return jsx ...
  // Success State
  if (isSubmitted) {
    return (
      <div className="animate-fade-in text-center">
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>

        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Request Submitted
        </h1>

        <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
          Thank you for your interest.  An administrator will review your request
          and you'll receive an email once it's been processed.
        </p>

        {/* What happens next */}
        <Card className="mb-8 text-left">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-zinc-200 mb-3">
              What happens next? 
            </h3>
            <ol className="text-sm text-zinc-500 space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-zinc-400">
                  1
                </span>
                <span>An admin reviews your request</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-zinc-400">
                  2
                </span>
                <span>You receive an email with the decision</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-zinc-400">
                  3
                </span>
                <span>If approved, you'll get login credentials</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Button
          variant="secondary"
          onClick={() => router.push("/login")}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

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
          Request Access
        </h1>
        <p className="text-sm text-zinc-500">
          Fill out the form below to request access to Aeon
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-400/80">
          Access requests are reviewed by administrators.  Please provide accurate
          information to help process your request.
        </p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            placeholder="John"
            autoComplete="given-name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            disabled={isLoading}
            {...register("firstName")}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            autoComplete="family-name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.lastName?.message}
            disabled={isLoading}
            {...register("lastName")}
          />
        </div>

        {/* Email */}
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

        {/* Reason Textarea */}
        <div className="w-full">
          <label className="block text-sm font-medium text-zinc-200 mb-2">
            Why do you want to join? 
          </label>
          <div className="relative">
            <textarea
              placeholder="Tell us about yourself and why you'd like to join..."
              rows={4}
              disabled={isLoading}
              className={`
                w-full px-3 py-2.5 bg-black/20 border rounded-md resize-none
                text-sm text-zinc-300 placeholder:text-zinc-600
                transition-all duration-200
                focus:outline-none focus:ring-1
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  errors.reason
                    ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                    : "border-white/10 focus:border-white/20 focus:ring-white/10"
                }
              `}
              {...register("reason")}
            />
          </div>
          <div className="flex justify-between mt-2">
            {errors.reason ? (
              <p className="text-xs text-red-400">{errors.reason.message}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-zinc-600">{reasonValue.length}/500</span>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-2">
          <Checkbox
            label="I agree to the terms and conditions"
            description="By checking this, you agree to our Terms of Service and Privacy Policy."
            disabled={isLoading}
            {...register("agreeToTerms")}
          />
          {errors.agreeToTerms && (
            <p className="mt-2 text-xs text-red-400">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
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

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#050505] px-4 text-zinc-600">
            Already have an account? 
          </span>
        </div>
      </div>

      {/* Sign In Button */}
      <Button
        variant="secondary"
        className="w-full"
        size="lg"
        onClick={() => router.push("/login")}
        leftIcon={<ArrowLeft className="h-4 w-4" />}
      >
        Back to sign in
      </Button>
    </div>
  );
}