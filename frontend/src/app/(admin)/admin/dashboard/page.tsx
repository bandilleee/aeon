import { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard - Aeon",
  description: "Your Aeon dashboard overview",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}