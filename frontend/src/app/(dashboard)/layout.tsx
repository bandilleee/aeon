import { DashboardEntry } from "@/components/layout/dashboard-entry";

export default function DashboardLayout({
  children,
}:  {
  children: React.ReactNode;
}) {
  return <DashboardEntry isAdmin={false}>{children}</DashboardEntry>;
}