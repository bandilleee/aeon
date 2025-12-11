import { DashboardEntry } from "@/components/layout/dashboard-entry";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardEntry isAdmin={true}>{children}</DashboardEntry>;
}