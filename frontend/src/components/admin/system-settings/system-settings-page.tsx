"use client";

import { useState, useEffect } from "react";
import {
  Settings, Shield, Bell, Palette, Calendar, Users, Puzzle, Database,
  Save, RotateCcw, CheckCircle, AlertTriangle, Upload, RefreshCw,
  Download, Loader2, X, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ConfirmationModal } from "@/components/ui/modal";
import { SystemSettings } from "@/types/system-settings.types";
import { mockSystemSettings, timezones, dateFormats, languages } from "@/lib/mock-system-settings";
import { systemSettingsService } from "@/services/system-settings.service";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "general" | "security" | "notifications" | "appearance"
  | "events" | "members" | "integrations" | "backups";

const settingsTabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "general",       label: "General",       icon: Settings,  description: "Platform name, timezone, language" },
  { id: "security",      label: "Security",       icon: Shield,    description: "Passwords, sessions, 2FA" },
  { id: "notifications", label: "Notifications",  icon: Bell,      description: "Email configuration" },
  { id: "appearance",    label: "Appearance",     icon: Palette,   description: "Branding, colors, theme" },
  { id: "events",        label: "Events",         icon: Calendar,  description: "Event settings, categories" },
  { id: "members",       label: "Members",        icon: Users,     description: "Registration, profiles" },
  { id: "integrations",  label: "Integrations",   icon: Puzzle,    description: "Third-party connections" },
  { id: "backups",       label: "Backups",        icon: Database,  description: "Backup & restore" },
];

// ─── Deep merge helper ───────────────────────────────────────────────────────
function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key in override) {
    const k = key as keyof T;
    const ov = override[k];
    const bv = base[k];
    if (
      ov !== null && ov !== undefined &&
      typeof ov === "object" && !Array.isArray(ov) &&
      typeof bv === "object" && !Array.isArray(bv)
    ) {
      result[k] = deepMerge(bv as object, ov as object) as T[keyof T];
    } else if (ov !== undefined) {
      result[k] = ov as T[keyof T];
    }
  }
  return result;
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab]             = useState<SettingsTab>("general");
  const [settings, setSettings]               = useState<SystemSettings>(mockSystemSettings);
  const [hasChanges, setHasChanges]           = useState(false);
  const [isSaving, setIsSaving]               = useState(false);
  const [isLoading, setIsLoading]             = useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showResetModal, setShowResetModal]   = useState(false);
  const [loadError, setLoadError]             = useState<string | null>(null);
  const [saveError, setSaveError]             = useState<string | null>(null);

  // ─── LOAD FROM BACKEND ON MOUNT ──────────────────────────────────────────
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await systemSettingsService.getSettings();
        if (res.success && res.data && Object.keys(res.data).length > 0) {
          setSettings(deepMerge(mockSystemSettings, res.data as SystemSettings));
        } else {
          setSettings(mockSystemSettings);
        }
      } catch (err) {
        console.error("Failed to load system settings:", err);
        setLoadError("Could not load saved settings. Showing defaults.");
        setSettings(mockSystemSettings);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const updateSettings = <K extends keyof SystemSettings>(
    section: K,
    updates: Partial<SystemSettings[K]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    setHasChanges(true);
    setSaveError(null);
  };

  // ─── SAVE TO BACKEND ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await systemSettingsService.saveSettings(settings);
      if (res.success) {
        setHasChanges(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } else {
        setSaveError("Failed to save settings. Please try again.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError("An error occurred while saving. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── RESET TO DEFAULTS ───────────────────────────────────────────────────
  const handleReset = () => {
    setSettings(mockSystemSettings);
    setHasChanges(false);
    setShowResetModal(false);
    setSaveError(null);
  };

  const ActiveTabIcon = settingsTabs.find((t) => t.id === activeTab)?.icon || Settings;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
        <p className="text-zinc-400">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-linear-to-br from-violet-500/20 to-violet-500/5 rounded-xl border border-violet-500/20">
                <Settings className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">System Settings</h1>
                <p className="text-sm text-zinc-500">Configure your platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {loadError && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-amber-400">{loadError}</span>
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <X className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-400">{saveError}</span>
                </div>
              )}
              {showSaveSuccess && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Settings saved successfully</span>
                </div>
              )}
              {hasChanges && (
                <>
                  <Button variant="ghost" onClick={() => setShowResetModal(true)} className="text-zinc-500">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                  <Button onClick={handleSave} isLoading={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <nav className="sticky top-24 space-y-1">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group",
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-black" : "text-zinc-500 group-hover:text-zinc-300"
                    )} />
                    <div className="min-w-0">
                      <p className={cn("text-sm font-medium", isActive ? "text-black" : "")}>{tab.label}</p>
                      <p className={cn("text-xs truncate", isActive ? "text-zinc-700" : "text-zinc-600")}>{tab.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-8">
              <div className={cn(
                "p-3 rounded-2xl border",
                activeTab === "security"      ? "bg-red-500/10 border-red-500/20" :
                activeTab === "notifications" ? "bg-blue-500/10 border-blue-500/20" :
                "bg-violet-500/10 border-violet-500/20"
              )}>
                <ActiveTabIcon className={cn(
                  "h-6 w-6",
                  activeTab === "security"      ? "text-red-400" :
                  activeTab === "notifications" ? "text-blue-400" :
                  "text-violet-400"
                )} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {settingsTabs.find((t) => t.id === activeTab)?.label} Settings
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {settingsTabs.find((t) => t.id === activeTab)?.description}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {activeTab === "general"       && <GeneralSettingsTab       settings={settings.general}       onUpdate={(u) => updateSettings("general", u)} />}
              {activeTab === "security"      && <SecuritySettingsTab      settings={settings.security}      onUpdate={(u) => updateSettings("security", u)} />}
              {activeTab === "notifications" && <NotificationSettingsTab  settings={settings.notifications} onUpdate={(u) => updateSettings("notifications", u)} />}
              {activeTab === "appearance"    && <AppearanceSettingsTab    settings={settings.appearance}    onUpdate={(u) => updateSettings("appearance", u)} />}
              {activeTab === "events"        && <EventSettingsTab         settings={settings.events}        onUpdate={(u) => updateSettings("events", u)} />}
              {activeTab === "members"       && <MemberSettingsTab        settings={settings.members}       onUpdate={(u) => updateSettings("members", u)} />}
              {activeTab === "integrations"  && <IntegrationSettingsTab   settings={settings.integrations}  onUpdate={(u) => updateSettings("integrations", u)} />}
              {activeTab === "backups"       && <BackupSettingsTab        settings={settings.backups}       onUpdate={(u) => updateSettings("backups", u)} onSaveParent={handleSave} />}
            </div>
          </div>
        </div>
      </div>

      {/* FIX 1: confirmLabel → confirmText (matches ConfirmationModalProps) */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Discard Changes"
        description="Are you sure you want to discard all unsaved changes? This will reset settings to the last saved state."
        confirmText="Discard"
        variant="danger"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   REUSABLE PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */

function SettingsSection({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-zinc-100">{title}</h3>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
      </div>
      <div className="bg-zinc-900/50 rounded-2xl border border-white/5 divide-y divide-white/5">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, description, children }: {
  label: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// FIX: translate-x-5 (was translate-x-6 which caused the dot to overflow)
function Toggle({ checked, onChange, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "w-11 h-6 rounded-full transition-colors duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        checked ? "bg-emerald-500" : "bg-zinc-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
        checked ? "translate-x-5" : "translate-x-1"
      )} />
    </button>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", className }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-sm text-zinc-200",
        "placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors",
        className
      )}
    />
  );
}

function SelectInput({ value, onChange, options, className }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-sm text-zinc-200",
        "focus:outline-none focus:border-white/20 transition-colors",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function NumberInput({ value, onChange, min, max, suffix }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-white/20 transition-colors"
      />
      {suffix && <span className="text-xs text-zinc-500">{suffix}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function GeneralSettingsTab({ settings, onUpdate }: {
  settings: SystemSettings["general"];
  onUpdate: (u: Partial<SystemSettings["general"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Platform Identity" description="Basic information about your platform">
        <SettingsRow label="Platform Name" description="Displayed in the browser tab and emails">
          <TextInput value={settings.platformName} onChange={(v) => onUpdate({ platformName: v })} placeholder="Aeon Community" className="w-64" />
        </SettingsRow>
        <SettingsRow label="Platform Description" description="Short tagline for your platform">
          <TextInput value={settings.platformDescription} onChange={(v) => onUpdate({ platformDescription: v })} placeholder="Community management platform" className="w-64" />
        </SettingsRow>
        <SettingsRow label="Language" description="Default interface language">
          <SelectInput value={settings.language} onChange={(v) => onUpdate({ language: v })} options={languages} className="w-40" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Localization" description="Date, time, and timezone settings">
        <SettingsRow label="Timezone">
          <SelectInput value={settings.timezone} onChange={(v) => onUpdate({ timezone: v })} options={timezones} className="w-52" />
        </SettingsRow>
        <SettingsRow label="Date Format">
          <SelectInput value={settings.dateFormat} onChange={(v) => onUpdate({ dateFormat: v })} options={dateFormats} className="w-40" />
        </SettingsRow>
        {/* FIX 2: cast the string to the literal union type */}
        <SettingsRow label="Time Format">
          <SelectInput
            value={settings.timeFormat}
            onChange={(v) => onUpdate({ timeFormat: v as "12h" | "24h" })}
            options={[
              { value: "12h", label: "12-hour (AM/PM)" },
              { value: "24h", label: "24-hour" },
            ]}
            className="w-40"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Maintenance" description="Platform availability settings">
        <SettingsRow label="Maintenance Mode" description="Temporarily take the platform offline for users">
          <Toggle checked={settings.maintenanceMode} onChange={(v) => onUpdate({ maintenanceMode: v })} />
        </SettingsRow>
        {settings.maintenanceMode && (
          <SettingsRow label="Maintenance Message" description="Shown to users during maintenance">
            <TextInput
              value={settings.maintenanceMessage ?? ""}
              onChange={(v) => onUpdate({ maintenanceMessage: v })}
              placeholder="We'll be back soon!"
              className="w-72"
            />
          </SettingsRow>
        )}
      </SettingsSection>
    </div>
  );
}

function SecuritySettingsTab({ settings, onUpdate }: {
  settings: SystemSettings["security"];
  onUpdate: (u: Partial<SystemSettings["security"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Password Policy">
        <SettingsRow label="Minimum Length">
          <NumberInput value={settings.minPasswordLength} onChange={(v) => onUpdate({ minPasswordLength: v })} min={6} max={32} suffix="characters" />
        </SettingsRow>
        <SettingsRow label="Require Uppercase">
          <Toggle checked={settings.requireUppercase} onChange={(v) => onUpdate({ requireUppercase: v })} />
        </SettingsRow>
        <SettingsRow label="Require Lowercase">
          <Toggle checked={settings.requireLowercase} onChange={(v) => onUpdate({ requireLowercase: v })} />
        </SettingsRow>
        <SettingsRow label="Require Numbers">
          <Toggle checked={settings.requireNumbers} onChange={(v) => onUpdate({ requireNumbers: v })} />
        </SettingsRow>
        <SettingsRow label="Require Special Characters">
          <Toggle checked={settings.requireSpecialChars} onChange={(v) => onUpdate({ requireSpecialChars: v })} />
        </SettingsRow>
        <SettingsRow label="Password Expiry" description="Days before password must be changed">
          <NumberInput value={settings.passwordExpiryDays} onChange={(v) => onUpdate({ passwordExpiryDays: v })} min={0} max={365} suffix="days" />
        </SettingsRow>
        <SettingsRow label="Prevent Reuse" description="Number of previous passwords to block">
          <NumberInput value={settings.preventPasswordReuse} onChange={(v) => onUpdate({ preventPasswordReuse: v })} min={0} max={24} suffix="passwords" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Session & Login">
        <SettingsRow label="Session Timeout" description="Minutes of inactivity before logout">
          <NumberInput value={settings.sessionTimeout} onChange={(v) => onUpdate({ sessionTimeout: v })} min={5} max={1440} suffix="minutes" />
        </SettingsRow>
        <SettingsRow label="Max Concurrent Sessions">
          <NumberInput value={settings.maxConcurrentSessions} onChange={(v) => onUpdate({ maxConcurrentSessions: v })} min={1} max={10} suffix="sessions" />
        </SettingsRow>
        <SettingsRow label="Max Failed Attempts" description="Lockout after this many failures">
          <NumberInput value={settings.maxLoginAttempts} onChange={(v) => onUpdate({ maxLoginAttempts: v })} min={3} max={20} />
        </SettingsRow>
        <SettingsRow label="Lockout Duration">
          <NumberInput value={settings.lockoutDuration} onChange={(v) => onUpdate({ lockoutDuration: v })} min={1} max={1440} suffix="minutes" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Two-Factor Authentication">
        <SettingsRow label="Require 2FA for all users">
          <Toggle checked={settings.twoFactorRequired} onChange={(v) => onUpdate({ twoFactorRequired: v })} />
        </SettingsRow>
        <SettingsRow label="Grace Period" description="Days users have to set up 2FA">
          <NumberInput value={settings.twoFactorGracePeriodDays} onChange={(v) => onUpdate({ twoFactorGracePeriodDays: v })} min={0} max={30} suffix="days" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="IP Access Control">
        <SettingsRow label="Enable IP Whitelist" description="Only allow listed IP addresses">
          <Toggle checked={settings.ipWhitelistEnabled} onChange={(v) => onUpdate({ ipWhitelistEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Enable IP Blacklist" description="Block listed IP addresses">
          <Toggle checked={settings.ipBlacklistEnabled} onChange={(v) => onUpdate({ ipBlacklistEnabled: v })} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function NotificationSettingsTab({ settings, onUpdate }: {
  settings: SystemSettings["notifications"];
  onUpdate: (u: Partial<SystemSettings["notifications"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Email Provider">
        <SettingsRow label="Provider">
          <SelectInput
            value={settings.emailProvider}
            onChange={(v) => onUpdate({ emailProvider: v as "smtp" | "sendgrid" | "mailgun" | "ses" })}
            options={[
              { value: "smtp",     label: "SMTP" },
              { value: "sendgrid", label: "SendGrid" },
              { value: "mailgun",  label: "Mailgun" },
              { value: "ses",      label: "Amazon SES" },
            ]}
            className="w-40"
          />
        </SettingsRow>
        {settings.emailProvider === "smtp" && (
          <>
            <SettingsRow label="SMTP Host">
              <TextInput value={settings.smtpHost ?? ""} onChange={(v) => onUpdate({ smtpHost: v })} placeholder="smtp.example.com" className="w-64" />
            </SettingsRow>
            <SettingsRow label="SMTP Port">
              <NumberInput value={settings.smtpPort ?? 587} onChange={(v) => onUpdate({ smtpPort: v })} min={1} max={65535} />
            </SettingsRow>
            <SettingsRow label="SMTP Username">
              <TextInput value={settings.smtpUsername ?? ""} onChange={(v) => onUpdate({ smtpUsername: v })} className="w-64" />
            </SettingsRow>
            <SettingsRow label="SMTP Password">
              <TextInput value={settings.smtpPassword ?? ""} onChange={(v) => onUpdate({ smtpPassword: v })} type="password" className="w-64" />
            </SettingsRow>
            <SettingsRow label="Use TLS/SSL">
              <Toggle checked={settings.smtpSecure ?? true} onChange={(v) => onUpdate({ smtpSecure: v })} />
            </SettingsRow>
          </>
        )}
        {settings.emailProvider === "sendgrid" && (
          <SettingsRow label="SendGrid API Key">
            <TextInput value={settings.sendgridApiKey ?? ""} onChange={(v) => onUpdate({ sendgridApiKey: v })} type="password" placeholder="SG.xxx..." className="w-64" />
          </SettingsRow>
        )}
        <SettingsRow label="From Email">
          <TextInput value={settings.fromEmail} onChange={(v) => onUpdate({ fromEmail: v })} placeholder="no-reply@aeon.com" className="w-64" />
        </SettingsRow>
        <SettingsRow label="From Name">
          <TextInput value={settings.fromName} onChange={(v) => onUpdate({ fromName: v })} placeholder="Aeon Community" className="w-64" />
        </SettingsRow>
        <SettingsRow label="Reply-To Email">
          <TextInput value={settings.replyToEmail ?? ""} onChange={(v) => onUpdate({ replyToEmail: v })} placeholder="support@aeon.com" className="w-64" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Email Notifications">
        <SettingsRow label="Enable Email Notifications">
          <Toggle checked={settings.emailNotificationsEnabled} onChange={(v) => onUpdate({ emailNotificationsEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Welcome Emails">
          <Toggle checked={settings.welcomeEmailEnabled} onChange={(v) => onUpdate({ welcomeEmailEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Password Reset Emails">
          <Toggle checked={settings.passwordResetEmailEnabled} onChange={(v) => onUpdate({ passwordResetEmailEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Event Reminder Emails">
          <Toggle checked={settings.eventReminderEmailEnabled} onChange={(v) => onUpdate({ eventReminderEmailEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Event Approval Emails">
          <Toggle checked={settings.eventApprovalEmailEnabled} onChange={(v) => onUpdate({ eventApprovalEmailEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Task Assignment Emails">
          <Toggle checked={settings.taskAssignmentEmailEnabled} onChange={(v) => onUpdate({ taskAssignmentEmailEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Weekly Digest">
          <Toggle checked={settings.weeklyDigestEnabled} onChange={(v) => onUpdate({ weeklyDigestEnabled: v })} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function AppearanceSettingsTab({ settings, onUpdate }: {
  settings: SystemSettings["appearance"];
  onUpdate: (u: Partial<SystemSettings["appearance"]>) => void;
}) {
  // FIX 3: AppearanceSettings has `logoUrl` (optional string)
  const handleLogoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdate({ logoUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="space-y-8">
      <SettingsSection title="Branding">
        <SettingsRow label="Primary Color" description="Main accent color for the platform">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e.target.value })}
              className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
            />
            <TextInput value={settings.primaryColor} onChange={(v) => onUpdate({ primaryColor: v })} className="w-28" />
          </div>
        </SettingsRow>
        <SettingsRow label="Secondary Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
              className="w-10 h-8 rounded bg-transparent border-0 cursor-pointer"
            />
            <TextInput value={settings.secondaryColor} onChange={(v) => onUpdate({ secondaryColor: v })} className="w-28" />
          </div>
        </SettingsRow>

        {/* FIX 3 continued: using logoUrl from the actual type */}
        <SettingsRow label="Logo" description="Platform logo">
          <div className="flex items-center gap-3">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo preview" className="h-8 w-auto rounded border border-white/10" />
            )}
            <Button variant="secondary" size="sm" onClick={handleLogoUpload}>
              <Upload className="h-4 w-4 mr-2" />
              {settings.logoUrl ? "Change Logo" : "Upload Logo"}
            </Button>
            {settings.logoUrl && (
              <Button variant="ghost" size="sm" onClick={() => onUpdate({ logoUrl: undefined })} className="text-zinc-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Login Page">
        <SettingsRow label="Welcome Text" description="Text shown on the login page">
          <TextInput value={settings.loginWelcomeText ?? ""} onChange={(v) => onUpdate({ loginWelcomeText: v })} placeholder="Welcome back!" className="w-64" />
        </SettingsRow>
        <SettingsRow label="Footer Text">
          <TextInput value={settings.footerText ?? ""} onChange={(v) => onUpdate({ footerText: v })} placeholder="© 2025 Aeon" className="w-64" />
        </SettingsRow>
        <SettingsRow label="Show Powered By Badge">
          <Toggle checked={settings.showPoweredBy} onChange={(v) => onUpdate({ showPoweredBy: v })} />
        </SettingsRow>
        <SettingsRow label="Allow Users to Toggle Theme">
          <Toggle checked={settings.allowUserThemeToggle} onChange={(v) => onUpdate({ allowUserThemeToggle: v })} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function EventSettingsTab({ settings, onUpdate }: {
  settings: SystemSettings["events"];
  onUpdate: (u: Partial<SystemSettings["events"]>) => void;
}) {
  return (
    <div className="space-y-8">
      {/* FIX 4: Removed `allowMemberEvents` — not in EventSettings type. Using only real fields. */}
      <SettingsSection title="Event Workflow">
        <SettingsRow label="Require Approval" description="New events must be approved by admins">
          <Toggle checked={settings.requireApproval} onChange={(v) => onUpdate({ requireApproval: v })} />
        </SettingsRow>
        <SettingsRow label="Auto-Approve for Leaders" description="Leaders bypass the approval queue">
          <Toggle checked={settings.autoApproveForLeaders} onChange={(v) => onUpdate({ autoApproveForLeaders: v })} />
        </SettingsRow>
        <SettingsRow label="Allow Waitlist">
          <Toggle checked={settings.allowWaitlist} onChange={(v) => onUpdate({ allowWaitlist: v })} />
        </SettingsRow>
        <SettingsRow label="Allow Event Comments">
          <Toggle checked={settings.allowEventComments} onChange={(v) => onUpdate({ allowEventComments: v })} />
        </SettingsRow>
        <SettingsRow label="Allow Event Ratings">
          <Toggle checked={settings.allowEventRatings} onChange={(v) => onUpdate({ allowEventRatings: v })} />
        </SettingsRow>
        <SettingsRow label="Default Max Attendees">
          <NumberInput value={settings.maxAttendeesDefault} onChange={(v) => onUpdate({ maxAttendeesDefault: v })} min={1} max={10000} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function MemberSettingsTab({ settings, onUpdate }: {
  settings: SystemSettings["members"];
  onUpdate: (u: Partial<SystemSettings["members"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Registration">
        <SettingsRow label="Allow Self Registration">
          {/* FIX 5 & 6: use actual field names from MemberSettings type */}
          <Toggle checked={settings.allowSelfRegistration} onChange={(v) => onUpdate({ allowSelfRegistration: v })} />
        </SettingsRow>
        <SettingsRow label="Require Email Verification">
          <Toggle checked={settings.requireEmailVerification} onChange={(v) => onUpdate({ requireEmailVerification: v })} />
        </SettingsRow>
        <SettingsRow label="Require Admin Approval">
          <Toggle checked={settings.requireAdminApproval} onChange={(v) => onUpdate({ requireAdminApproval: v })} />
        </SettingsRow>
        <SettingsRow label="Default Role">
          <SelectInput
            value={settings.defaultRole}
            onChange={(v) => onUpdate({ defaultRole: v })}
            options={[
              { value: "member", label: "Member" },
              { value: "viewer", label: "Viewer" },
            ]}
            className="w-40"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Profiles & Directory">
        {/* FIX 6: allowProfileEditing is the correct field name */}
        <SettingsRow label="Allow Profile Editing">
          <Toggle checked={settings.allowProfileEditing} onChange={(v) => onUpdate({ allowProfileEditing: v })} />
        </SettingsRow>
        <SettingsRow label="Show Member Directory">
          <Toggle checked={settings.showMemberDirectory} onChange={(v) => onUpdate({ showMemberDirectory: v })} />
        </SettingsRow>
        <SettingsRow label="Allow Member Search">
          <Toggle checked={settings.allowMemberSearch} onChange={(v) => onUpdate({ allowMemberSearch: v })} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function IntegrationSettingsTab({ settings, onUpdate }: {
  settings: SystemSettings["integrations"];
  onUpdate: (u: Partial<SystemSettings["integrations"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Slack">
        <SettingsRow label="Enable Slack Integration">
          <Toggle checked={settings.slackEnabled} onChange={(v) => onUpdate({ slackEnabled: v })} />
        </SettingsRow>
        {settings.slackEnabled && (
          <SettingsRow label="Webhook URL">
            <TextInput value={settings.slackWebhookUrl ?? ""} onChange={(v) => onUpdate({ slackWebhookUrl: v })} placeholder="https://hooks.slack.com/..." className="w-72" />
          </SettingsRow>
        )}
      </SettingsSection>

      <SettingsSection title="Microsoft Teams">
        <SettingsRow label="Enable Teams Integration">
          <Toggle checked={settings.teamsEnabled} onChange={(v) => onUpdate({ teamsEnabled: v })} />
        </SettingsRow>
        {settings.teamsEnabled && (
          <SettingsRow label="Webhook URL">
            <TextInput value={settings.teamsWebhookUrl ?? ""} onChange={(v) => onUpdate({ teamsWebhookUrl: v })} placeholder="https://outlook.office.com/webhook/..." className="w-72" />
          </SettingsRow>
        )}
      </SettingsSection>

      <SettingsSection title="Google Calendar">
        <SettingsRow label="Enable Google Calendar Sync">
          <Toggle checked={settings.googleCalendarEnabled} onChange={(v) => onUpdate({ googleCalendarEnabled: v })} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Google Analytics">
        <SettingsRow label="Enable Google Analytics">
          <Toggle checked={settings.googleAnalyticsEnabled} onChange={(v) => onUpdate({ googleAnalyticsEnabled: v })} />
        </SettingsRow>
        {settings.googleAnalyticsEnabled && (
          <SettingsRow label="Measurement ID">
            <TextInput value={settings.googleAnalyticsId ?? ""} onChange={(v) => onUpdate({ googleAnalyticsId: v })} placeholder="G-XXXXXXXXXX" className="w-48" />
          </SettingsRow>
        )}
      </SettingsSection>
    </div>
  );
}

function BackupSettingsTab({
  settings,
  onUpdate,
  onSaveParent,
}: {
  settings: SystemSettings["backups"];
  onUpdate: (u: Partial<SystemSettings["backups"]>) => void;
  onSaveParent: () => Promise<void>;
}) {
  const [isBackingUp,   setIsBackingUp]   = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [backupError,   setBackupError]   = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    setBackupError(null);
    setBackupSuccess(null);
    try {
      const res = await systemSettingsService.triggerBackup();
      if (res.success && res.data) {
        onUpdate({
          lastBackupAt:     res.data.backedUpAt,
          lastBackupSize:   res.data.backupSize,
          lastBackupStatus: "success",
        });
        await onSaveParent();
        setBackupSuccess(`Backup complete — ${res.data.backupSize} (${res.data.backupFile})`);
        setTimeout(() => setBackupSuccess(null), 6000);
      } else {
        setBackupError("Backup failed. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Backup failed. Check server logs.";
      setBackupError(msg);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    systemSettingsService.downloadBackup();
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const formatBackupTime = (timestamp?: string) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString("en-ZA", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <SettingsSection title="Automatic Backups">
        <SettingsRow label="Enable Auto Backup">
          <Toggle checked={settings.autoBackupEnabled} onChange={(v) => onUpdate({ autoBackupEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Frequency">
          <SelectInput
            value={settings.backupFrequency}
            onChange={(v) => onUpdate({ backupFrequency: v as "daily" | "weekly" | "monthly" })}
            options={[
              { value: "daily",   label: "Daily" },
              { value: "weekly",  label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
            className="w-36"
          />
        </SettingsRow>
        <SettingsRow label="Retention Period">
          <NumberInput value={settings.backupRetentionDays} onChange={(v) => onUpdate({ backupRetentionDays: v })} min={1} max={365} suffix="days" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Manual Backup">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-200">Last Backup</p>
              <p className="text-xs text-zinc-500 mt-0.5">{formatBackupTime(settings.lastBackupAt)}</p>
              {settings.lastBackupSize && (
                <p className="text-xs text-zinc-500">Size: {settings.lastBackupSize}</p>
              )}
              {settings.lastBackupStatus && (
                <span className={cn(
                  "inline-flex items-center gap-1 text-xs mt-1",
                  settings.lastBackupStatus === "success" ? "text-emerald-400" : "text-red-400"
                )}>
                  {settings.lastBackupStatus === "success"
                    ? <><CheckCircle className="h-3 w-3" /> Successful</>
                    : <><AlertTriangle className="h-3 w-3" /> Failed</>
                  }
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleManualBackup} isLoading={isBackingUp} disabled={isBackingUp}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isBackingUp && "animate-spin")} />
                {isBackingUp ? "Backing up..." : "Backup Now"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownload}
                isLoading={isDownloading}
                disabled={isDownloading || !settings.lastBackupAt}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {backupSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-sm text-emerald-400">{backupSuccess}</span>
            </div>
          )}
          {backupError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{backupError}</span>
            </div>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}