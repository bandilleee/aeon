import { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password - Aeon",
  description: "Create a new password for your Aeon account",
};

/**
 * We wrap in Suspense because we use useSearchParams
 * which requires client-side rendering
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-center">
        <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-zinc-800 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-zinc-800 rounded w-1/2 mx-auto" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-zinc-800 rounded" />
        <div className="h-12 bg-zinc-800 rounded" />
        <div className="h-12 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}