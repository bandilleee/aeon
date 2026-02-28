"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Terminal, ArrowRight, ArrowLeft, Copy, Check, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/services/auth.service"; // <-- Bridge!
import { useAuth } from '@/contexts/auth-context';

const verifyCodeSchema = z.object({
  code: z.string().min(6, "Code must be 6 digits").max(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

const MOCK_2FA_DATA = {
  secret: "JBSWY3DPEHPK3PXP", 
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Aeon:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Aeon",
};

export function TwoFactorConfigure() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.id || "user_1";
  
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const [qrData] = useState(MOCK_2FA_DATA);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  const codeValue = watch("code", "");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setValue("code", value);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(qrData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch (err) {}
  };

  const onSubmit = async (data: VerifyCodeFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      // Call our real C# backend to verify TOTP
      const response = await authService.verify2FA(currentUserId, data.code);
      
      if (!response.success) {
        setServerError(response.error?.message || "Invalid verification code.");
        return;
      }

      router.push("/setup-2fa/backup-codes");
    } catch (error) {
      setServerError("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ... keep the exact same JSX return logic below ...
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

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-medium">
            1
          </div>
          <span className="text-xs text-zinc-300">Scan</span>
        </div>
        <div className="w-8 h-px bg-zinc-800" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs font-medium">
            2
          </div>
          <span className="text-xs text-zinc-600">Verify</span>
        </div>
        <div className="w-8 h-px bg-zinc-800" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs font-medium">
            3
          </div>
          <span className="text-xs text-zinc-600">Backup</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Set up authenticator
        </h1>
        <p className="text-sm text-zinc-500">
          Scan the QR code with your authenticator app
        </p>
      </div>

      {/* QR Code Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {/* QR Code */}
            <div className="bg-white p-3 rounded-lg mb-4">
              <img
                src={qrData.qrCodeUrl}
                alt="2FA QR Code"
                className="w-40 h-40"
              />
            </div>

            {/* Can't scan instructions */}
            <p className="text-xs text-zinc-500 mb-3">
              Can't scan? Enter this code manually:
            </p>

            {/* Secret Key */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-md px-3 py-2">
              <code className="text-sm text-zinc-300 font-mono tracking-wider">
                {qrData.secret}
              </code>
              <button
                type="button"
                onClick={copySecret}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title="Copy secret"
              >
                {secretCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Apps */}
      <div className="mb-6 p-3 bg-zinc-900/50 border border-white/5 rounded-lg">
        <p className="text-xs text-zinc-500 mb-2">Recommended apps:</p>
        <div className="flex flex-wrap gap-2">
          {["Google Authenticator", "Microsoft Authenticator", "Authy", "1Password"].map(
            (app) => (
              <span
                key={app}
                className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400"
              >
                {app}
              </span>
            )
          )}
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-200 mb-2">
            Enter verification code
          </label>
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] font-mono"
            error={errors.code?.message}
            disabled={isLoading}
            {...register("code")}
            onChange={handleCodeChange}
          />
          <p className="mt-2 text-xs text-zinc-600">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          disabled={codeValue.length !== 6}
          rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
        >
          Verify and continue
        </Button>
      </form>

      {/* Back Button */}
      <div className="mt-4">
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/setup-2fa")}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
      </div>

      {/* Help Text */}
      <p className="mt-6 text-center text-xs text-zinc-600">
        Having trouble?{" "}
        <a href="#" className="text-zinc-500 hover:text-zinc-400 transition-colors">
          Get help
        </a>
      </p>
    </div>
  );
}