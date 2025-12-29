import { Metadata } from "next";
import { MembersDirectory } from "@/components/members/members-directory";

export const metadata: Metadata = {
  title: "Members - Aeon",
  description: "Your community members",
};

export default function MembersPage() {
  // Can add: groupId/group context from props or auth if multi-group in future
  return <MembersDirectory />;
}