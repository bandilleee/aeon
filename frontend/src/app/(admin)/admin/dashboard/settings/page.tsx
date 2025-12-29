"use client";
import { useState } from "react";
import { User, ShieldCheck, Bell } from "lucide-react";
import SettingsProfilePanel from "@/components/settings/SettingsProfilePanel";
import SettingsSecurityPanel from "@/components/settings/SettingsSecurityPanel";
import SettingsNotificationsPanel from "@/components/settings/SettingsNotificationsPanel";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  { key: "security", label: "Security", icon: <ShieldCheck className="h-5 w-5" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
];

export default function SettingsPage() {
  const [active, setActive] = useState("profile");
  return (
    <div className="mx-auto max-h-screen p-4 md:p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      <div className="flex items-center space-x-4 mb-8">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-medium rounded-md transition-all",
              active === s.key
                ? " text-blue-400 shadow border-b-2 border-blue-500"
                : "text-zinc-400 hover:text-blue-300"
            )}
            onClick={() => setActive(s.key)}
            type="button"
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>
      <div>
        {active === "profile" && <SettingsProfilePanel />}
        {active === "security" && <SettingsSecurityPanel />}
        {active === "notifications" && <SettingsNotificationsPanel />}
      </div>
    </div>
  );
}