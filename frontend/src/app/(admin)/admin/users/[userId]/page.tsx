import { Metadata } from "next";
import UsersManagementPage from "@/components/admin/users/users-management-page";

export const metadata: Metadata = {
  title: "User Details - Aeon Admin",
};

interface UserPageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: UserPageProps) {
  const { userId } = await params;
  // The users management page handles the detail panel — pass the pre-selected userId
  // via a search param so it opens the side panel automatically
  return <UsersManagementPage preselectedUserId={userId} />;
}