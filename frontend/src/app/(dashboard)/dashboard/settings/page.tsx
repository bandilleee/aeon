"use client";

import { useState } from "react";
import { User, ShieldCheck, Bell } from "lucide-react";
import SettingsProfilePanel from "@/components/settings/SettingsProfilePanel";
import SettingsSecurityPanel from "@/components/settings/SettingsSecurityPanel";
import SettingsNotificationsPanel from "@/components/settings/SettingsNotificationsPanel";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "profile", label: "Public Profile", icon: <User className="h-4 w-4" /> },
  { key: "security", label: "Security & Access", icon: <ShieldCheck className="h-4 w-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const [active, setActive] = useState("profile");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-sm text-zinc-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                active === s.key
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {active === "profile" && <SettingsProfilePanel />}
          {active === "security" && <SettingsSecurityPanel />}
          {active === "notifications" && <SettingsNotificationsPanel />}
        </div>
      </div>
    </div>
  );
}