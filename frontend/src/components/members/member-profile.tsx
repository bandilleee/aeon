"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, MoreHorizontal, Loader2, AlertTriangle } from "lucide-react";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { Member } from "@/types/member.types";
import { memberService } from "@/services/members.service"; // <-- Our bridge!
import { EditMemberModal } from "@/components/members/edit-member-modal"; // <-- Added the missing modal!

export function MemberProfile({ memberId }: { memberId: string }) {
  // --- REAL DATA STATES ---
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  // --- FETCH MEMBER DATA ---
  useEffect(() => {
    async function loadMember() {
      try {
        setIsLoading(true);
        const response = await memberService.getMemberById(memberId);
        
        if (response.success && response.data) {
          setMember(response.data);
        } else {
          setError(response.error?.message || "Member not found");
        }
      } catch (err) {
        setError("Network error connecting to the server.");
      } finally {
        setIsLoading(false);
      }
    }
    loadMember();
  }, [memberId]);

  // --- REAL EDIT HANDLER ---
  async function handleEdit(updated: Member) {
    try {
      const response = await memberService.updateMember(updated.id, updated);
      if (response.success && response.data) {
        setMember(response.data); // Update the UI instantly!
        setShowEdit(false);
      } else {
        alert("Failed to update member.");
      }
    } catch (error) {
      alert("Network error occurred.");
    }
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading profile...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !member) {
    return (
      <div className="p-4 md:p-8 text-center text-zinc-600 flex flex-col items-center">
        <AlertTriangle className="h-8 w-8 mb-4 text-zinc-500" />
        <p>{error || "Member not found."}</p>
        <Link href="/dashboard/members">
          <Button variant="secondary" className="mt-4">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  // --- TIMEZONE FIXES ---
  const safeJoinedAt = member.joinedAt.endsWith('Z') ? member.joinedAt : `${member.joinedAt}Z`;
  const safeLastSeen = member.lastSeen ? (member.lastSeen.endsWith('Z') ? member.lastSeen : `${member.lastSeen}Z`) : null;

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
              <img src={member.avatarUrl} alt={member.displayName} className="w-24 h-24 rounded-full border border-white/10 object-cover" />
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
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          </div>

          <div className="flex-1 min-w-[220px]">
            <h2 className="text-2xl font-semibold text-white">{member.displayName}</h2>
            <div className="flex gap-2 mt-2">
              {member.status === "active" && <Badge variant="success">Active</Badge>}
              {member.status === "pending" && <Badge variant="info">Pending</Badge>}
              {member.status === "banned" && <Badge variant="danger">Banned</Badge>}
              {member.status === "left" && <Badge variant="neutral">Left</Badge>}
            </div>
            
            <div className="mt-4 space-y-1 text-zinc-400 text-base">
              <div><span className="text-zinc-500 text-xs mr-2">Email:</span>{member.email}</div>
              {member.phone && <div><span className="text-zinc-500 text-xs mr-2">Phone:</span>{member.phone}</div>}
              <div><span className="text-zinc-500 text-xs mr-2">Joined:</span>{new Date(safeJoinedAt).toLocaleDateString()}</div>
              <div><span className="text-zinc-500 text-xs mr-2">Last seen:</span>{safeLastSeen ? new Date(safeLastSeen).toLocaleString() : "—"}</div>
            </div>

            {member.bio && (
              <div className="mt-4 max-w-xl p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{member.bio}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* The fully functional Edit Modal we built earlier! */}
      {showEdit && (
        <EditMemberModal
          isOpen={showEdit}
          member={member}
          onClose={() => setShowEdit(false)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}