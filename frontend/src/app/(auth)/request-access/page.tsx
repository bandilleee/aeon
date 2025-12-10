import { Metadata } from "next";
import { RequestAccessForm } from "@/components/forms/request-access-form";

export const metadata: Metadata = {
  title: "Request Access - Aeon",
  description: "Request access to join the Aeon platform",
};

export default function RequestAccessPage() {
  return <RequestAccessForm />;
}