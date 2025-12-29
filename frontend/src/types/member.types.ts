export type MemberRole = "member" | "leader" | "admin";
export type MemberStatus = "active" | "pending" | "banned" | "left";

export interface Member {
  id: string;
  displayName: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  role: MemberRole;
  status: MemberStatus;
  bio?: string;
  phone?: string;
  joinedAt: string;
  lastSeen: string; // ISO
  badges?: string[]; // ["early-adopter", "python-expert"]
}