import { Metadata } from "next";
import { SetPasswordForm } from "@/components/forms/set-password-form";

export const metadata: Metadata = {
  title: "Set Your Password - Aeon",
  description: "Create a new password for your Aeon account",
};

export default function SetPasswordPage() {
  return <SetPasswordForm />;
}