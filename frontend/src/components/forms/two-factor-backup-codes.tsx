"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal,
  ArrowRight,
  Download,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Printer,
  FileText,
} from "lucide-react";

import { Button, Checkbox } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Mock backup codes - In production, these come from your C# backend
 */
const MOCK_BACKUP_CODES = [
  "A1B2-C3D4-E5F6",
  "G7H8-I9J0-K1L2",
  "M3N4-O5P6-Q7R8",
  "S9T0-U1V2-W3X4",
  "Y5Z6-A7B8-C9D0",
  "E1F2-G3H4-I5J6",
  "K7L8-M9N0-O1P2",
  "Q3R4-S5T6-U7V8",
  "W9X0-Y1Z2-A3B4",
  "C5D6-E7F8-G9H0",
];

export function TwoFactorBackupCodes() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);
  const [codesDownloaded, setCodesDownloaded] = useState(false);
  const [confirmSaved, setConfirmSaved] = useState(false);

  const backupCodes = MOCK_BACKUP_CODES;

  const copyAllCodes = async () => {
    try {
      const codesText = backupCodes.join("\n");
      await navigator.clipboard.writeText(codesText);
      setCodesCopied(true);
      setTimeout(() => setCodesCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadCodes = () => {
    const codesText = `AEON BACKUP CODES
==================
Generated: ${new Date().toLocaleDateString()}

Keep these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}

IMPORTANT: 
- Store these codes securely
- Each code can only be used once
- Generate new codes if these are lost
`;

    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aeon-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setCodesDownloaded(true);
  };

  const printCodes = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Aeon Backup Codes</title>
            <style>
              body { font-family: monospace; padding: 40px; }
              h1 { font-size: 24px; margin-bottom: 20px; }
              .code { 
                font-size: 18px; 
                padding: 8px 16px; 
                margin: 8px 0; 
                background: #f5f5f5; 
                border-radius: 4px;
                display: inline-block;
              }
              .warning { 
                margin-top: 30px; 
                padding: 16px; 
                background: #fff3cd; 
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <h1>Aeon Backup Codes</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            <p>Keep these codes in a safe place. Each code can only be used once.</p>
            <div>
              ${backupCodes.map((code, i) => `<div class="code">${i + 1}. ${code}</div>`).join("")}
            </div>
            <div class="warning">
              <strong>Important:</strong> Store these codes securely. Each code can only be used once.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    
    // TODO: Call API to confirm 2FA setup complete
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    router.push("/dashboard");
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

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center">
            <Check className="h-3 w-3" />
          </div>
          <span className="text-xs text-zinc-500">Scan</span>
        </div>
        <div className="w-8 h-px bg-emerald-500" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center">
            <Check className="h-3 w-3" />
          </div>
          <span className="text-xs text-zinc-500">Verify</span>
        </div>
        <div className="w-8 h-px bg-white" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-medium">
            3
          </div>
          <span className="text-xs text-zinc-300">Backup</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Save your backup codes
        </h1>
        <p className="text-sm text-zinc-500">
          Use these codes to access your account if you lose your phone
        </p>
      </div>

      {/* Warning Banner */}
      <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-400/90 font-medium mb-1">
            Save these codes now
          </p>
          <p className="text-xs text-amber-400/70">
            You won't be able to see them again. Each code can only be used once.
          </p>
        </div>
      </div>

      {/* Backup Codes Grid */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <div
                key={code}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded px-3 py-2"
              >
                <span className="text-xs text-zinc-600 w-4">{index + 1}.</span>
                <code className="text-sm text-zinc-300 font-mono">{code}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={copyAllCodes}
          leftIcon={
            codesCopied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )
          }
        >
          {codesCopied ? "Copied!" : "Copy"}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={downloadCodes}
          leftIcon={
            codesDownloaded ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Download className="h-4 w-4" />
            )
          }
        >
          {codesDownloaded ? "Downloaded!" : "Download"}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={printCodes}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print
        </Button>
      </div>

      {/* Tips Card */}
      <Card className="mb-6 bg-zinc-900/50">
        <CardContent className="p-4">
          <p className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wider">
            Storage tips
          </p>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              Save in a password manager
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              Print and store in a safe place
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              Don't store with your password
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Confirmation Checkbox */}
      <div className="mb-6">
        <Checkbox
          label="I have saved my backup codes"
          description="I understand that I won't be able to see these codes again."
          checked={confirmSaved}
          onCheckedChange={(checked) => setConfirmSaved(checked)}
        />
      </div>

      {/* Continue Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleContinue}
        isLoading={isLoading}
        disabled={!confirmSaved}
        rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
      >
        Continue to dashboard
      </Button>

      {/* Success Note */}
      <div className="mt-6 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
        <p className="text-xs text-emerald-400/80">
          Two-factor authentication will be enabled once you continue.
        </p>
      </div>
    </div>
  );
}