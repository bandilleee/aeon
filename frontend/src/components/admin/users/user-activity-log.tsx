"use client";

import { Activity, User, Shield, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { UserActivityLog as ActivityLogType } from "@/types/admin-user.types";

interface UserActivityLogProps {
  activities: ActivityLogType[];
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActivityIcon(action: string) {
  if (action.toLowerCase().includes("login")) return Activity;
  if (action.toLowerCase().includes("user")) return User;
  if (action.toLowerCase().includes("permission") || action.toLowerCase().includes("role")) return Shield;
  return Calendar;
}

export function UserActivityLog({ activities }: UserActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.action);
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200">{activity.action}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{activity.details}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
                <span>{formatTimestamp(activity.timestamp)}</span>
                {activity.ipAddress && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {activity.ipAddress}
                  </span>
                )}
                {activity.performedBy && (
                  <span>by {activity.performedBy.displayName}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}