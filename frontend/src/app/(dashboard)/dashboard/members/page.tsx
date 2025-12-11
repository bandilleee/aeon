import { Metadata } from "next";

export const metadata:  Metadata = {
  title: "Members - Aeon",
  description: "View community members",
};

export default function MembersPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold text-white mb-2">Members</h1>
      <p className="text-zinc-500">Members directory coming soon...</p>
    </div>
  );
}