import { Metadata } from "next";
import { MemberProfile } from "@/components/members/member-profile";

export const metadata: Metadata = {
  title: "Member Profile - Aeon",
  description: "View member details",
};

interface MemberPageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export default async function MemberPage({ params }: MemberPageProps) {
  // Next.js requires us to 'await' the params to extract the ID from the URL
  const { memberId } = await params;
  
  // We pass that exact ID down to the profile component we just built!
  return <MemberProfile memberId={memberId} />;
}