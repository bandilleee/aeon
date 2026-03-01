"use client";
import { useState } from "react";
import { Card, CardContent, Button, Checkbox } from "@/components/ui";
import { Bell, Calendar, ListChecks, Users } from "lucide-react";

export default function SettingsNotifications() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    eventNotifications: true,
    taskNotifications: false,
    memberNotifications: true,
  });
  const [success, setSuccess] = useState(false);

  function handleSave() {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1600);
    // send changes to backend
  }
  return (
    <Card className="bg-zinc-900/80 border border-zinc-700 shadow-lg rounded-xl">
      <CardContent className="pt-10 px-6 md:px-10 pb-16 flex flex-col gap-8 max-w-xl">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5" /> Notification Preferences
        </h2>
        <Checkbox
          label={<span className="flex items-center gap-2"><Bell className="h-4 w-4" /> All email notifications</span>}
          checked={notifications.emailNotifications}
          onCheckedChange={(checked) => setNotifications(f => ({ ...f, emailNotifications: checked }))}
        />
        <Checkbox
          label={<span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Event notifications</span>}
          checked={notifications.eventNotifications}
          onCheckedChange={(checked) => setNotifications(f => ({ ...f, eventNotifications: checked }))}
        />
        <Checkbox
          label={<span className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Task notifications</span>}
          checked={notifications.taskNotifications}
          onCheckedChange={(checked) => setNotifications(f => ({ ...f, taskNotifications: checked }))}
        />
        <Checkbox
          label={<span className="flex items-center gap-2"><Users className="h-4 w-4" /> Member activity</span>}
          checked={notifications.memberNotifications}
          onCheckedChange={(checked) => setNotifications(f => ({ ...f, memberNotifications: checked }))}
        />
        <div className="flex justify-end pt-6">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
        {success && <p className="text-green-400 mt-2">Preferences saved!</p>}
      </CardContent>
    </Card>
  );
}