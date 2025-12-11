import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Aeon",
  description: "Manage your settings",
};

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold text-white mb-2">Settings</h1>
      <p className="text-zinc-500">Settings module coming soon...</p>
    </div>
  );
}