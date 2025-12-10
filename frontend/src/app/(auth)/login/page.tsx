import { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title:  "Sign In - Aeon",
  description: "Sign in to your Aeon account",
};

export default function LoginPage() {
  return <LoginForm />;
}