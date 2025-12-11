"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";

export function TwoFactorPrompt() {
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const handleEnable2FA = () => {
    router.push("/setup-2fa/configure");
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    
    // TODO: Call API to mark 2FA as skipped
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    router.push("/dashboard");
  };

  // Skip Confirmation Modal
  if (showSkipConfirm) {
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
            <ShieldOff className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            Skip 2FA setup?
          </h1>
          <p className="text-sm text-zinc-500">
            Your account will be less secure without two-factor authentication. 
          </p>
        </div>

        {/* Warning Card */}
        <Card className="mb-6 bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-amber-400/90 font-medium">
                  Without 2FA, your account is vulnerable to: 
                </p>
                <ul className="text-xs text-amber-400/70 space-y-1">
                  <li>• Password breaches and leaks</li>
                  <li>• Phishing attacks</li>
                  <li>• Unauthorized access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowSkipConfirm(false)}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
          >
            Go back and enable 2FA
          </Button>

          <Button
            variant="ghost"
            className="w-full text-zinc-500"
            size="lg"
            onClick={handleSkip}
            isLoading={isSkipping}
          >
            Skip anyway
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          You can enable 2FA later in your security settings.
        </p>
      </div>
    );
  }

  // Main Prompt
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

      {/* Shield Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
            <Lock className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Secure your account
        </h1>
        <p className="text-sm text-zinc-500">
          Add an extra layer of security with two-factor authentication
        </p>
      </div>

      {/* Benefits Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <p className="text-xs text-zinc-500 font-medium mb-3 uppercase tracking-wider">
            Why enable 2FA? 
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-300">Protect against password theft</p>
                <p className="text-xs text-zinc-600">
                  Even if your password is compromised, attackers can't access your account. 
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-300">Enterprise-grade security</p>
                <p className="text-xs text-zinc-600">
                  Meet compliance requirements and protect sensitive data.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-300">Quick and easy setup</p>
                <p className="text-xs text-zinc-600">
                  Takes less than 2 minutes with your phone.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Methods */}
      <div className="mb-6 p-4 bg-zinc-900/50 border border-white/5 rounded-lg">
        <p className="text-xs text-zinc-500 mb-3">Supported methods:</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Smartphone className="h-4 w-4" />
            <span className="text-xs">Authenticator App</span>
          </div>
          <div className="text-zinc-700">•</div>
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="text-xs">Google, Microsoft, Authy, etc.</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleEnable2FA}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Enable two-factor authentication
        </Button>

        <Button
          variant="ghost"
          className="w-full text-zinc-500"
          size="lg"
          onClick={() => setShowSkipConfirm(true)}
        >
          Skip for now
        </Button>
      </div>

      {/* Note */}
      <p className="mt-6 text-center text-xs text-zinc-600">
        You can always enable 2FA later in your security settings. 
      </p>
    </div>
  );
}