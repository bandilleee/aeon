import { Metadata } from "next";
import { MemberProfile } from "@/components/members/member-profile";

export const metadata: Metadata = {
  title: "Member - Aeon",
  description: "Member profile",
};

interface MemberPageProps {
  params: {
    id: string;
  };
}

export default function MemberPage({ params }: MemberPageProps) {
  return <MemberProfile memberId={params.id} />;
}