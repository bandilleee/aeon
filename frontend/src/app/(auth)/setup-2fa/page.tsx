import { Metadata } from "next";
import { TwoFactorPrompt } from "@/components/forms/two-factor-prompt";

export const metadata: Metadata = {
  title:  "Setup Two-Factor Authentication - Aeon",
  description: "Secure your account with two-factor authentication",
};

export default function SetupTwoFactorPage() {
  return <TwoFactorPrompt />;
}