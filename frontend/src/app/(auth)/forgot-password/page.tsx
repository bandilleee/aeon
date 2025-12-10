import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password - Aeon",
  description: "Reset your Aeon account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}