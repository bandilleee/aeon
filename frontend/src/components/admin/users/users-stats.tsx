"use client";

import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Shield,
  Crown,
  KeyRound,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";

interface StatsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    admins: number;
    leaders: number;
    twoFactorEnabled: number;
  };
}

export function UsersStats({ stats }: StatsProps) {
  const statItems = [
    {
      title: "Total Users",
      value: stats.total,
      icon: Users,
      iconBg: "bg-white/5",
      iconColor: "text-zinc-400",
      borderColor: "border-white/10",
    },
    {
      title: "Active",
      value: stats.active,
      icon: UserCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: UserPlus,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Suspended/Locked",
      value: stats.suspended,
      icon: UserX,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      borderColor: "border-red-500/20",
    },
    {
      title: "Administrators",
      value: stats.admins,
      icon: Shield,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
      borderColor: "border-violet-500/20",
    },
    {
      title: "Community Leaders",
      value: stats.leaders,
      icon: Crown,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      title: "2FA Enabled",
      value: stats.twoFactorEnabled,
      subtitle: `${Math.round((stats.twoFactorEnabled / stats.total) * 100)}%`,
      icon: KeyRound,
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-400",
      borderColor: "border-teal-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg border ${item.iconBg} ${item.borderColor}`}
              >
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-semibold text-zinc-100">{item.value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{item.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}