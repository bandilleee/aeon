"use client";

import { Calendar, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

interface StatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAttendees: number;
  };
}

export function EventApprovalsStats({ stats }: StatsProps) {
  const statItems = [
    {
      title: "Total Events",
      value: stats.total,
      icon: Calendar,
      iconBg: "bg-white/5",
      iconColor: "text-zinc-400",
      borderColor: "border-white/10",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      borderColor: "border-red-500/20",
    },
    {
      title: "Total Attendees",
      value: stats.totalAttendees,
      icon: Users,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg border ${item.iconBg} ${item.borderColor}`}
              >
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-100">{item.value}</p>
                <p className="text-xs text-zinc-500">{item.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}