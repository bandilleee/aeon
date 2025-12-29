"use client";
import { useState } from "react";
import { Card, CardContent, Button, Checkbox } from "@/components/ui";
import { Bell, Calendar, ListChecks, Users } from "lucide-react";

export default function SettingsNotificationsPanel() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    eventNotifications: true,
    taskNotifications: false,
    memberNotifications: true,
  });
  const [success, setSuccess] = useState(false);

  function handleSave() {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1200);
    // send changes to backend
  }
  return (
    <Card className="bg-zinc-900/80 border border-zinc-700 shadow-lg rounded-2xl">
      <CardContent className="py-10 px-8 flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notification Preferences
        </h2>
        <Checkbox
          label={<span className="flex items-center gap-2"><Bell className="h-4 w-4" /> All email notifications</span>}
          checked={notifications.emailNotifications}
          onChange={e => setNotifications(f => ({ ...f, emailNotifications: e.target.checked }))}
        />
        <Checkbox
          label={<span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Event notifications</span>}
          checked={notifications.eventNotifications}
          onChange={e => setNotifications(f => ({ ...f, eventNotifications: e.target.checked }))}
        />
        <Checkbox
          label={<span className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Task notifications</span>}
          checked={notifications.taskNotifications}
          onChange={e => setNotifications(f => ({ ...f, taskNotifications: e.target.checked }))}
        />
        <Checkbox
          label={<span className="flex items-center gap-2"><Users className="h-4 w-4" /> Member activity</span>}
          checked={notifications.memberNotifications}
          onChange={e => setNotifications(f => ({ ...f, memberNotifications: e.target.checked }))}
        />
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
        {success && <p className="text-green-400 mt-2">Preferences saved!</p>}
      </CardContent>
    </Card>
  );
}