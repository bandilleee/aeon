"use client";
import { useState, useMemo } from "react";
import {
  UserPlus,
  Download,
  Search,
  UserCheck,
  X,
  MoreHorizontal
} from "lucide-react";
import { mockMembers } from "@/lib/mock-data";
import { Member } from "@/types/member.types";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import Link from "next/link";
import { AddMemberModal } from "@/components/members/add-member-modal";
import { EditMemberModal } from "@/components/members/edit-member-modal";
import { cn } from "@/lib/utils";

function formatTimeAgo(iso: string) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MembersDirectory() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>(mockMembers);

  // Only show role == member (no leaders/admins)
  const filtered = useMemo(() => {
    return members.filter((m: Member) => {
      if (m.role !== "member") return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !(
            m.displayName.toLowerCase().includes(q) ||
            (m.email && m.email.toLowerCase().includes(q)) ||
            (m.phone && m.phone.toLowerCase().includes(q))
          )
        ) return false;
      }
      return true;
    });
  }, [search, members]);

  // Export filtered members as CSV
  function exportCSV() {
    const csv =
      "Name & Surname,Email,Phone,Bio,Status,Joined\n" +
      filtered
        .map(
          (m) =>
            `"${m.displayName}","${m.email}","${m.phone || ""}","${m.bio || ""}","${m.status}","${m.joinedAt}"`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAdd(member: { name: string; email: string; bio: string; phone: string; sendEmail: boolean; status: string }) {
    setMembers((prev: Member[]) => [
      {
        id: "user_" + Math.random().toString(36).slice(2, 7),
        initials:
          member.name
            .split(" ")
            .map((chunk: string) => chunk[0])
            .join("")
            .toUpperCase() || "M",
        displayName: member.name,
        email: member.email,
        bio: member.bio,
        phone: member.phone,
        joinedAt: new Date().toISOString(),
        lastSeen: "",
        role: "member",
        status: member.status as Member["status"],
        avatarUrl: "",
        badges: [],
      },
      ...prev,
    ]);
  }

  function handleEdit(updated: Member) {
    setMembers((prev: Member[]) =>
      prev.map((m: Member) => (m.id === updated.id ? { ...m, ...updated } : m))
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
            Members
          </h1>
          <p className="text-sm text-zinc-500">
            Only your community members are listed here. No access or platform controls.
          </p>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<Download className="h-4 w-4" />} variant="secondary" onClick={exportCSV} >
            Export CSV
          </Button>
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
            Add Member
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full bg-transparent table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs text-zinc-500">Name & Surname</th>
                <th className="px-4 py-2 text-left text-xs text-zinc-500">Email</th>
                <th className="px-4 py-2 text-left text-xs text-zinc-500">Phone</th>
                <th className="px-4 py-2 text-left text-xs text-zinc-500">Bio</th>
                <th className="px-4 py-2 text-left text-xs text-zinc-500">Status</th>
                <th className="px-4 py-2 text-left text-xs text-zinc-500">Joined</th>
                <th className="px-4 py-2 text-left text-xs text-zinc-500">Last Seen</th>
                <th className="px-4 py-2 text-xs text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-zinc-500 text-sm">
                    No members found
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-3 min-w-[140px]">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt={m.displayName} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-xs text-white font-bold">
                          {m.initials}
                        </div>
                      )}
                      <span className="text-sm text-white font-medium">{m.displayName}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{m.email}</td>
                    <td className="px-4 py-3 text-zinc-300">{m.phone || "—"}</td>
                    <td className="px-4 py-3 text-zinc-300">{m.bio || "—"}</td>
                    <td className="px-4 py-3">
                      {m.status === "active" && <Badge variant="success">Active</Badge>}
                      {m.status === "pending" && <Badge variant="info">Pending</Badge>}
                      {m.status === "banned" && <Badge variant="danger">Banned</Badge>}
                      {m.status === "left" && <Badge variant="neutral">Left</Badge>}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{new Date(m.joinedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatTimeAgo(m.lastSeen)}</td>
                    <td className="px-4 py-3">
                      <Button size="icon" variant="ghost">
                        <Link href={`/dashboard/members/${m.id}`} title="View profile">
                          <UserCheck className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost"
                        onClick={() => { setEditMember(m as Member); setShowEdit(true); }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <AddMemberModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      {editMember && (
        <EditMemberModal
          isOpen={showEdit}
          member={editMember}
          onClose={() => { setShowEdit(false); setEditMember(null); }}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}