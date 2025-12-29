"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, UserPlus, MoreHorizontal } from "lucide-react";
import { mockMembers } from "@/lib/mock-data";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Member } from "@/types/member.types";

export function MemberProfile({ memberId }: { memberId: string }) {
  const member = useMemo(
    () => mockMembers.find((m) => m.id === memberId && m.role === "member"),
    [memberId]
  );
  const [showEdit, setShowEdit] = useState(false);

  if (!member) {
    return (
      <div className="p-4 md:p-8 text-center text-zinc-600">
        <p>Member not found.</p>
        <Link href="/dashboard/members">
          <Button variant="secondary" className="mt-4">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-3">
          <ArrowLeft className="h-4 w-4" /> Directory
        </Link>
      </div>
      <Card>
        <CardContent className="flex gap-8 flex-wrap items-top py-8 px-4 sm:px-12">
          <div className="flex flex-col items-center gap-3 min-w-[120px]">
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.displayName} className="w-24 h-24 rounded-full border border-white/10" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-3xl text-white font-bold border border-white/10">
                {member.initials}
              </div>
            )}
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              <Button size="sm" variant="secondary" onClick={() => setShowEdit(true)}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {/* communication/action buttons if allowed */}
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 min-w-[220px]">
            <h2 className="text-2xl font-semibold text-white">{member.displayName}</h2>
            {member.status === "active" && <Badge variant="success">Active</Badge>}
            {member.status === "pending" && <Badge variant="info">Pending</Badge>}
            {member.status === "banned" && <Badge variant="danger">Banned</Badge>}
            {member.status === "left" && <Badge variant="neutral">Left</Badge>}
            <div className="mt-4 space-y-1 text-zinc-400 text-base">
              <div><span className="text-zinc-500 text-xs mr-2">Email:</span>{member.email}</div>
              <div><span className="text-zinc-500 text-xs mr-2">Joined:</span>{new Date(member.joinedAt).toLocaleDateString()}</div>
              <div><span className="text-zinc-500 text-xs mr-2">Last seen:</span>{member.lastSeen ? new Date(member.lastSeen).toLocaleString() : "—"}</div>
            </div>
            {member.bio && (
              <div className="mt-3 max-w-xl">
                <p className="text-zinc-400 text-ellipsis line-clamp-4">{member.bio}</p>
              </div>
            )}
            {/* No badges, no role edit, no "promote"/ban controls here. */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}