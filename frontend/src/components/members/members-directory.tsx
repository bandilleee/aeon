"use client";
import { useState, useMemo, useEffect } from "react";
import { UserPlus, Download, Search, UserCheck, X, MoreHorizontal, Loader2, AlertTriangle } from "lucide-react";
import { Member } from "@/types/member.types";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import Link from "next/link";
import { AddMemberModal } from "@/components/members/add-member-modal";
import { EditMemberModal } from "@/components/members/edit-member-modal";
import { cn } from "@/lib/utils";
import { memberService } from "@/services/members.service"; // <-- Our new bridge!

function formatTimeAgo(iso: string) {
  if (!iso) return "—";
  // Timezone Fix
  const safeIso = iso.endsWith('Z') ? iso : `${iso}Z`;
  const diffMs = Date.now() - new Date(safeIso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string) {
  return name.split(" ").map((chunk) => chunk[0]).join("").toUpperCase().substring(0, 2) || "M";
}

export function MembersDirectory() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  
  // --- REAL DATA STATES ---
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FETCH MEMBERS ---
  useEffect(() => {
    async function loadMembers() {
      try {
        setIsLoading(true);
        const response = await memberService.getAllMembers();
        if (response.success && response.data) {
          setMembers(response.data);
        } else {
          setError(response.error?.message || "Failed to load members");
        }
      } catch (err) {
        setError("Network error connecting to the server.");
      } finally {
        setIsLoading(false);
      }
    }
    loadMembers();
  }, []);

  // Filter members
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

  // Export CSV
  function exportCSV() {
    const csv =
      "Name & Surname,Email,Phone,Bio,Status,Joined\n" +
      filtered.map((m) => `"${m.displayName}","${m.email}","${m.phone || ""}","${m.bio || ""}","${m.status}","${m.joinedAt}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- REAL ADD HANDLER ---
  async function handleAdd(memberData: { name: string; email: string; bio: string; phone: string; sendEmail: boolean; status: string }) {
    try {
      const newMemberPayload = {
        displayName: memberData.name,
        email: memberData.email,
        bio: memberData.bio,
        phone: memberData.phone,
        status: memberData.status,
        role: "member",
        initials: getInitials(memberData.name)
      };

      const response = await memberService.createMember(newMemberPayload);

      if (response.success && response.data) {
        setMembers((prev) => [response.data!, ...prev]);
        setShowAdd(false);
      } else {
        alert("Failed to add member.");
      }
    } catch (error) {
      alert("Network error occurred.");
    }
  }

  // --- REAL EDIT HANDLER ---
  async function handleEdit(updated: Member) {
    try {
      const response = await memberService.updateMember(updated.id, updated);
      
      if (response.success && response.data) {
        setMembers((prev) => prev.map((m) => (m.id === updated.id ? response.data! : m)));
        setShowEdit(false);
        setEditMember(null);
      } else {
        alert("Failed to update member.");
      }
    } catch (error) {
      alert("Network error occurred.");
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">Members</h1>
          <p className="text-sm text-zinc-500">Only your community members are listed here. No access or platform controls.</p>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<Download className="h-4 w-4" />} variant="secondary" onClick={exportCSV} disabled={isLoading || members.length === 0}>
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
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Loading members...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 flex flex-col items-center">
              <AlertTriangle className="h-8 w-8 mb-2 opacity-80" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    <th className="px-4 py-2 text-xs text-zinc-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-zinc-500 text-sm">
                        {search ? "No members found matching your search." : "No members yet. Add your first member!"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m) => (
                      <tr key={m.id} className="border-t border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-3 min-w-[140px]">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.displayName} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-xs text-white font-bold">
                              {m.initials}
                            </div>
                          )}
                          <span className="text-sm text-white font-medium">{m.displayName}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300 text-sm">{m.email}</td>
                        <td className="px-4 py-3 text-zinc-300 text-sm whitespace-nowrap">{m.phone || "—"}</td>
                        <td className="px-4 py-3 text-zinc-300 text-sm max-w-[200px] truncate">{m.bio || "—"}</td>
                        <td className="px-4 py-3">
                          {m.status === "active" && <Badge variant="success">Active</Badge>}
                          {m.status === "pending" && <Badge variant="info">Pending</Badge>}
                          {m.status === "banned" && <Badge variant="danger">Banned</Badge>}
                          {m.status === "left" && <Badge variant="neutral">Left</Badge>}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">
                          {new Date(m.joinedAt.endsWith('Z') ? m.joinedAt : `${m.joinedAt}Z`).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">{formatTimeAgo(m.lastSeen)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Button size="icon" variant="ghost">
                              <Link href={`/dashboard/members/${m.id}`} title="View profile">
                                <UserCheck className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setEditMember(m); setShowEdit(true); }}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
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