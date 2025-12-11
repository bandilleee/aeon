import { Metadata } from "next";
import { TwoFactorConfigure } from "@/components/forms/two-factor-configure";

export const metadata:  Metadata = {
  title: "Configure 2FA - Aeon",
  description: "Set up your authenticator app",
};

export default function ConfigureTwoFactorPage() {
  return <TwoFactorConfigure />;
}