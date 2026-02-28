"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Switch } from "@/components/ui";
import { Bell, Calendar, ListChecks, Users, Mail, Save, CheckCircle, Loader2 } from "lucide-react";
import { settingsService } from "@/services/settings.service";
import { useAuth } from '@/contexts/auth-context';

export default function SettingsNotificationsPanel() {
  const { user } = useAuth();
  const currentUserId = user?.id || "user_1";

  const [notifications, setNotifications] = useState({
    emailNotifications: true, eventNotifications: true, taskNotifications: false, memberNotifications: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const response = await settingsService.getSettings(currentUserId);
        if (response.success && response.data) {
          setNotifications({
            emailNotifications: response.data.emailNotifications,
            eventNotifications: response.data.eventNotifications,
            taskNotifications: response.data.taskNotifications,
            memberNotifications: response.data.memberNotifications,
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [currentUserId]);

  async function handleSave() {
    try {
      setSaving(true);
      const response = await settingsService.updateNotifications(currentUserId, notifications);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-zinc-500" /> Communication Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Switch
            checked={notifications.emailNotifications}
            onChange={val => setNotifications(f => ({ ...f, emailNotifications: val }))}
            label="Email Notifications"
            description="Receive a daily digest and important alerts directly to your inbox."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-zinc-500" /> Platform Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 mt-1 hidden sm:block">
                <Calendar className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <Switch
                  checked={notifications.eventNotifications}
                  onChange={val => setNotifications(f => ({ ...f, eventNotifications: val }))}
                  label="Event Updates"
                  description="Get notified when an event is created, updated, or receives new RSVPs."
                />
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 mt-1 hidden sm:block">
                <ListChecks className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <Switch
                  checked={notifications.taskNotifications}
                  onChange={val => setNotifications(f => ({ ...f, taskNotifications: val }))}
                  label="Task Assignments"
                  description="Alerts for tasks assigned to you, impending due dates, and status changes."
                />
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 mt-1 hidden sm:block">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <Switch
                  checked={notifications.memberNotifications}
                  onChange={val => setNotifications(f => ({ ...f, memberNotifications: val }))}
                  label="Member Activity"
                  description="Notifications for new member registrations, profile updates, and departures."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-white/5">
            <div>
              {success && (
                <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle className="h-4 w-4" /> Preferences saved successfully
                </p>
              )}
            </div>
            <Button 
              isLoading={saving} 
              onClick={handleSave}
              leftIcon={<Save className="h-4 w-4" />}
              className="min-w-[170px]"
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}