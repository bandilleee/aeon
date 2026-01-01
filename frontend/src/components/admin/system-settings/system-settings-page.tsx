"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Palette,
  Calendar,
  Users,
  Puzzle,
  Database,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  MessageSquare,
  BarChart3,
  Upload,
  RefreshCw,
  Server,
  Cloud,
  HardDrive,
  Clock,
  Download,
  Play,
  Pause,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Modal, ConfirmationModal } from "@/components/ui/modal";
import { SystemSettings } from "@/types/system-settings.types";
import { mockSystemSettings, timezones, dateFormats, languages } from "@/lib/mock-system-settings";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "general"
  | "security"
  | "notifications"
  | "appearance"
  | "events"
  | "members"
  | "integrations"
  | "backups";

const settingsTabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "general", label: "General", icon: Settings, description:  "Platform name, timezone, language" },
  { id: "security", label: "Security", icon: Shield, description: "Passwords, sessions, 2FA" },
  { id: "notifications", label: "Notifications", icon:  Bell, description: "Email configuration" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Branding, colors, theme" },
  { id: "events", label: "Events", icon: Calendar, description: "Event settings, categories" },
  { id: "members", label: "Members", icon: Users, description: "Registration, profiles" },
  { id: "integrations", label: "Integrations", icon:  Puzzle, description: "Third-party connections" },
  { id: "backups", label: "Backups", icon:  Database, description: "Backup & restore" },
];

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [settings, setSettings] = useState<SystemSettings>(mockSystemSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const updateSettings = <K extends keyof SystemSettings>(
    section: K,
    updates: Partial<SystemSettings[K]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(mockSystemSettings);
    setHasChanges(false);
    setShowResetModal(false);
  };

  const ActiveTabIcon = settingsTabs.find((t) => t.id === activeTab)?.icon || Settings;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2. 5 bg-gradient-to-br from-violet-500/20 to-violet-500/5 rounded-xl border border-violet-500/20">
                <Settings className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">System Settings</h1>
                <p className="text-sm text-zinc-500">Configure your platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showSaveSuccess && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-slide-up">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Settings saved</span>
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
          {/* Sidebar Navigation */}
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
                    <Icon className={cn("h-5 w-5", isActive ? "text-black" : "text-zinc-500 group-hover:text-zinc-300")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", isActive ? "text-black" : "")}>{tab.label}</p>
                      <p className={cn("text-xs truncate", isActive ? "text-black/60" : "text-zinc-600")}>
                        {tab.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isActive ? "text-black/40" : "text-zinc-700 opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tab Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
              <div
                className={cn(
                  "p-3 rounded-2xl border",
                  activeTab === "security"
                    ? "bg-red-500/10 border-red-500/20"
                    : activeTab === "notifications"
                    ? "bg-blue-500/10 border-blue-500/20"
                    :  activeTab === "appearance"
                    ? "bg-pink-500/10 border-pink-500/20"
                    : "bg-violet-500/10 border-violet-500/20"
                )}
              >
                <ActiveTabIcon
                  className={cn(
                    "h-6 w-6",
                    activeTab === "security"
                      ? "text-red-400"
                      :  activeTab === "notifications"
                      ?  "text-blue-400"
                      : activeTab === "appearance"
                      ? "text-pink-400"
                      : "text-violet-400"
                  )}
                />
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

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === "general" && (
                <GeneralSettingsTab settings={settings. general} onUpdate={(updates) => updateSettings("general", updates)} />
              )}
              {activeTab === "security" && (
                <SecuritySettingsTab settings={settings.security} onUpdate={(updates) => updateSettings("security", updates)} />
              )}
              {activeTab === "notifications" && (
                <NotificationSettingsTab settings={settings.notifications} onUpdate={(updates) => updateSettings("notifications", updates)} />
              )}
              {activeTab === "appearance" && (
                <AppearanceSettingsTab settings={settings.appearance} onUpdate={(updates) => updateSettings("appearance", updates)} />
              )}
              {activeTab === "events" && (
                <EventSettingsTab settings={settings.events} onUpdate={(updates) => updateSettings("events", updates)} />
              )}
              {activeTab === "members" && (
                <MemberSettingsTab settings={settings.members} onUpdate={(updates) => updateSettings("members", updates)} />
              )}
              {activeTab === "integrations" && (
                <IntegrationSettingsTab settings={settings.integrations} onUpdate={(updates) => updateSettings("integrations", updates)} />
              )}
              {activeTab === "backups" && (
                <BackupSettingsTab settings={settings.backups} onUpdate={(updates) => updateSettings("backups", updates)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleReset}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}

/* ============================================
   REUSABLE COMPONENTS
   ============================================ */

function SettingsSection({ title, description, children }: { title: string; description?:  string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-zinc-100">{title}</h3>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
      </div>
      <div className="bg-zinc-900/50 rounded-2xl border border-white/5 divide-y divide-white/5">{children}</div>
    </div>
  );
}

function SettingsRow({ label, description, children }: { label:  string; description?: string; children: React. ReactNode }) {
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

function Toggle({ checked, onChange, disabled }: { checked:  boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => ! disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative",
        checked ?  "bg-emerald-500" : "bg-zinc-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
          checked ?  "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}:  {
  value:  string;
  onChange: (value: string) => void;
  placeholder?:  string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "bg-zinc-800 border border-white/10 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all placeholder: text-zinc-600",
        className
      )}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  className,
}:  {
  value:  string;
  onChange: (value: string) => void;
  options: { value: string; label:  string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "bg-zinc-800 border border-white/10 text-sm text-zinc-300 rounded-lg px-3 py-2 focus: outline-none focus: ring-1 focus:ring-violet-500/30 appearance-none cursor-pointer",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
}:  {
  value:  number;
  onChange: (value: number) => void;
  min?:  number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target. value) || 0)}
        min={min}
        max={max}
        className="w-20 bg-zinc-800 border border-white/10 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus: ring-violet-500/30 text-center"
      />
      {suffix && <span className="text-sm text-zinc-500">{suffix}</span>}
    </div>
  );
}

/* ============================================
   TAB COMPONENTS
   ============================================ */

function GeneralSettingsTab({
  settings,
  onUpdate,
}: {
  settings: SystemSettings["general"];
  onUpdate: (updates:  Partial<SystemSettings["general"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Platform Identity" description="Basic information about your platform">
        <SettingsRow label="Platform Name" description="The name displayed across your platform">
          <TextInput value={settings.platformName} onChange={(v) => onUpdate({ platformName: v })} className="w-64" />
        </SettingsRow>
        <SettingsRow label="Platform Description" description="A short description of your community">
          <TextInput value={settings. platformDescription} onChange={(v) => onUpdate({ platformDescription: v })} className="w-80" />
        </SettingsRow>
        <SettingsRow label="Platform Logo" description="Upload your logo (recommended:  200x50px)">
          <Button variant="secondary" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Logo
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Regional Settings" description="Timezone, date format, and language preferences">
        <SettingsRow label="Timezone" description="Default timezone for all users">
          <SelectInput value={settings.timezone} onChange={(v) => onUpdate({ timezone:  v })} options={timezones} className="w-64" />
        </SettingsRow>
        <SettingsRow label="Date Format" description="How dates are displayed">
          <SelectInput value={settings.dateFormat} onChange={(v) => onUpdate({ dateFormat: v })} options={dateFormats} className="w-64" />
        </SettingsRow>
        <SettingsRow label="Time Format">
          <div className="flex gap-2">
            {(["12h", "24h"] as const).map((format) => (
              <button
                key={format}
                onClick={() => onUpdate({ timeFormat:  format })}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg border transition-colors",
                  settings.timeFormat === format
                    ? "bg-white text-black border-white"
                    : "bg-zinc-800 text-zinc-400 border-white/10 hover:border-white/20"
                )}
              >
                {format === "12h" ?  "12-hour" : "24-hour"}
              </button>
            ))}
          </div>
        </SettingsRow>
        <SettingsRow label="Language" description="Default platform language">
          <SelectInput value={settings.language} onChange={(v) => onUpdate({ language: v })} options={languages} className="w-48" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Maintenance Mode" description="Temporarily disable access to the platform">
        <SettingsRow label="Enable Maintenance Mode" description="Only admins can access the platform when enabled">
          <Toggle checked={settings.maintenanceMode} onChange={(v) => onUpdate({ maintenanceMode: v })} />
        </SettingsRow>
        {settings.maintenanceMode && (
          <div className="p-4">
            <label className="block text-sm text-zinc-400 mb-2">Maintenance Message</label>
            <textarea
              value={settings.maintenanceMessage || ""}
              onChange={(e) => onUpdate({ maintenanceMessage: e.target.value })}
              rows={3}
              className="w-full bg-zinc-800 border border-white/10 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus: ring-violet-500/30 resize-none"
              placeholder="Message shown to users during maintenance..."
            />
          </div>
        )}
      </SettingsSection>
    </div>
  );
}

function SecuritySettingsTab({
  settings,
  onUpdate,
}: {
  settings: SystemSettings["security"];
  onUpdate: (updates:  Partial<SystemSettings["security"]>) => void;
}) {
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [newIp, setNewIp] = useState("");

  const addToBlacklist = () => {
    if (newIp && !settings.ipBlacklist.includes(newIp)) {
      onUpdate({ ipBlacklist: [...settings. ipBlacklist, newIp] });
      setNewIp("");
      setShowBlacklistModal(false);
    }
  };

  const removeFromBlacklist = (ip: string) => {
    onUpdate({ ipBlacklist: settings.ipBlacklist.filter((i) => i !== ip) });
  };

  return (
    <div className="space-y-8">
      <SettingsSection title="Password Policy" description="Requirements for user passwords">
        <SettingsRow label="Minimum Length">
          <NumberInput value={settings.minPasswordLength} onChange={(v) => onUpdate({ minPasswordLength:  v })} min={6} max={32} suffix="characters" />
        </SettingsRow>
        <SettingsRow label="Require Uppercase" description="At least one uppercase letter">
          <Toggle checked={settings.requireUppercase} onChange={(v) => onUpdate({ requireUppercase: v })} />
        </SettingsRow>
        <SettingsRow label="Require Lowercase" description="At least one lowercase letter">
          <Toggle checked={settings.requireLowercase} onChange={(v) => onUpdate({ requireLowercase: v })} />
        </SettingsRow>
        <SettingsRow label="Require Numbers" description="At least one number">
          <Toggle checked={settings.requireNumbers} onChange={(v) => onUpdate({ requireNumbers: v })} />
        </SettingsRow>
        <SettingsRow label="Require Special Characters" description="At least one special character (! @#$%^&*)">
          <Toggle checked={settings.requireSpecialChars} onChange={(v) => onUpdate({ requireSpecialChars: v })} />
        </SettingsRow>
        <SettingsRow label="Password Expiry" description="Force password change after this period (0 = never)">
          <NumberInput value={settings.passwordExpiryDays} onChange={(v) => onUpdate({ passwordExpiryDays:  v })} min={0} max={365} suffix="days" />
        </SettingsRow>
        <SettingsRow label="Prevent Password Reuse" description="Number of previous passwords that cannot be reused">
          <NumberInput value={settings.preventPasswordReuse} onChange={(v) => onUpdate({ preventPasswordReuse: v })} min={0} max={24} suffix="passwords" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Session Settings" description="Control user session behavior">
        <SettingsRow label="Session Timeout" description="Automatically log out inactive users">
          <NumberInput value={settings.sessionTimeout} onChange={(v) => onUpdate({ sessionTimeout:  v })} min={5} max={480} suffix="minutes" />
        </SettingsRow>
        <SettingsRow label="Max Concurrent Sessions" description="Maximum simultaneous logins per user">
          <NumberInput value={settings.maxConcurrentSessions} onChange={(v) => onUpdate({ maxConcurrentSessions: v })} min={1} max={10} suffix="sessions" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Two-Factor Authentication" description="Additional security layer for user accounts">
        <SettingsRow label="Require 2FA for All Users" description="Users must set up 2FA to access the platform">
          <Toggle checked={settings.twoFactorRequired} onChange={(v) => onUpdate({ twoFactorRequired:  v })} />
        </SettingsRow>
        {settings.twoFactorRequired && (
          <SettingsRow label="Grace Period" description="Days allowed to set up 2FA after first login">
            <NumberInput value={settings.twoFactorGracePeriodDays} onChange={(v) => onUpdate({ twoFactorGracePeriodDays: v })} min={0} max={30} suffix="days" />
          </SettingsRow>
        )}
      </SettingsSection>

      <SettingsSection title="Login Protection" description="Protect against brute force attacks">
        <SettingsRow label="Max Login Attempts" description="Lock account after this many failed attempts">
          <NumberInput value={settings.maxLoginAttempts} onChange={(v) => onUpdate({ maxLoginAttempts: v })} min={3} max={10} suffix="attempts" />
        </SettingsRow>
        <SettingsRow label="Lockout Duration" description="Time account remains locked after max attempts">
          <NumberInput value={settings.lockoutDuration} onChange={(v) => onUpdate({ lockoutDuration: v })} min={5} max={1440} suffix="minutes" />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="IP Security" description="Control access by IP address">
        <SettingsRow label="Enable IP Blacklist" description="Block access from specific IP addresses">
          <Toggle checked={settings.ipBlacklistEnabled} onChange={(v) => onUpdate({ ipBlacklistEnabled: v })} />
        </SettingsRow>
        {settings.ipBlacklistEnabled && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Blocked IPs ({settings.ipBlacklist.length})</span>
              <Button variant="secondary" size="sm" onClick={() => setShowBlacklistModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add IP
              </Button>
            </div>
            {settings.ipBlacklist.length > 0 ?  (
              <div className="space-y-2">
                {settings. ipBlacklist. map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                    <code className="text-sm text-zinc-300 font-mono">{ip}</code>
                    <button onClick={() => removeFromBlacklist(ip)} className="p-1 text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 text-center py-4">No IPs blocked</p>
            )}
          </div>
        )}
      </SettingsSection>

      <Modal isOpen={showBlacklistModal} onClose={() => setShowBlacklistModal(false)} title="Add IP to Blacklist" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">IP Address or CIDR Range</label>
            <TextInput value={newIp} onChange={setNewIp} placeholder="e.g., 192.168.1.1 or 10.0.0.0/24" className="w-full" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowBlacklistModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={addToBlacklist} disabled={!newIp}>
              Add to Blacklist
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function NotificationSettingsTab({
  settings,
  onUpdate,
}: {
  settings: SystemSettings["notifications"];
  onUpdate: (updates:  Partial<SystemSettings["notifications"]>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const handleTestEmail = async () => {
    setTestingEmail(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestingEmail(false);
  };

  return (
    <div className="space-y-8">
      <SettingsSection title="Email Provider" description="Configure how emails are sent">
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(["smtp", "sendgrid", "mailgun", "ses"] as const).map((provider) => (
              <button
                key={provider}
                onClick={() => onUpdate({ emailProvider: provider })}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all",
                  settings.emailProvider === provider
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                    :  "bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-white/10"
                )}
              >
                <Mail className={cn("h-6 w-6 mx-auto mb-2", settings.emailProvider === provider ? "text-violet-400" : "text-zinc-500")} />
                <span className="text-sm font-medium uppercase">{provider}</span>
              </button>
            ))}
          </div>

          {settings.emailProvider === "smtp" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">SMTP Host</label>
                <TextInput value={settings. smtpHost || ""} onChange={(v) => onUpdate({ smtpHost:  v })} placeholder="smtp.example.com" className="w-full" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">SMTP Port</label>
                <TextInput value={settings. smtpPort?. toString() || ""} onChange={(v) => onUpdate({ smtpPort: parseInt(v) || 587 })} placeholder="587" className="w-full" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Username</label>
                <TextInput value={settings.smtpUsername || ""} onChange={(v) => onUpdate({ smtpUsername: v })} placeholder="username" className="w-full" />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={settings.smtpPassword || ""}
                    onChange={(e) => onUpdate({ smtpPassword:  e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border border-white/10 text-sm text-zinc-300 rounded-lg px-3 py-2 pr-10 focus: outline-none focus: ring-1 focus:ring-violet-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smtpSecure || false}
                    onChange={(e) => onUpdate({ smtpSecure: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500/20"
                  />
                  <span className="text-sm text-zinc-300">Use TLS/SSL</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Sender Information" description="Email sender details">
        <SettingsRow label="From Email">
          <TextInput value={settings.fromEmail} onChange={(v) => onUpdate({ fromEmail: v })} placeholder="no-reply@example. com" className="w-64" />
        </SettingsRow>
        <SettingsRow label="From Name">
          <TextInput value={settings.fromName} onChange={(v) => onUpdate({ fromName:  v })} placeholder="Aeon Community" className="w-64" />
        </SettingsRow>
        <SettingsRow label="Reply-To Email">
          <TextInput value={settings. replyToEmail || ""} onChange={(v) => onUpdate({ replyToEmail:  v })} placeholder="support@example.com" className="w-64" />
        </SettingsRow>
        <div className="p-4">
          <Button variant="secondary" onClick={handleTestEmail} isLoading={testingEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Email Notifications" description="Toggle which emails are sent">
        <SettingsRow label="Email Notifications" description="Master toggle for all email notifications">
          <Toggle checked={settings.emailNotificationsEnabled} onChange={(v) => onUpdate({ emailNotificationsEnabled: v })} />
        </SettingsRow>
        <SettingsRow label="Welcome Email" description="Sent when a new user is created">
          <Toggle checked={settings.welcomeEmailEnabled} onChange={(v) => onUpdate({ welcomeEmailEnabled: v })} disabled={!settings.emailNotificationsEnabled} />
        </SettingsRow>
        <SettingsRow label="Password Reset Email" description="Sent when password reset is requested">
          <Toggle checked={settings.passwordResetEmailEnabled} onChange={(v) => onUpdate({ passwordResetEmailEnabled: v })} disabled={!settings.emailNotificationsEnabled} />
        </SettingsRow>
        <SettingsRow label="Event Reminders" description="Sent before events start">
          <Toggle checked={settings.eventReminderEmailEnabled} onChange={(v) => onUpdate({ eventReminderEmailEnabled:  v })} disabled={!settings.emailNotificationsEnabled} />
        </SettingsRow>
        <SettingsRow label="Event Approval Notifications" description="Sent when events are approved/rejected">
          <Toggle checked={settings. eventApprovalEmailEnabled} onChange={(v) => onUpdate({ eventApprovalEmailEnabled: v })} disabled={!settings. emailNotificationsEnabled} />
        </SettingsRow>
        <SettingsRow label="Task Assignments" description="Sent when tasks are assigned">
          <Toggle checked={settings.taskAssignmentEmailEnabled} onChange={(v) => onUpdate({ taskAssignmentEmailEnabled:  v })} disabled={!settings.emailNotificationsEnabled} />
        </SettingsRow>
        <SettingsRow label="Weekly Digest" description="Summary email sent weekly">
          <Toggle checked={settings. weeklyDigestEnabled} onChange={(v) => onUpdate({ weeklyDigestEnabled:  v })} disabled={!settings.emailNotificationsEnabled} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function AppearanceSettingsTab({
  settings,
  onUpdate,
}: {
  settings: SystemSettings["appearance"];
  onUpdate: (updates: Partial<SystemSettings["appearance"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Brand Colors" description="Customize your platform colors">
        <SettingsRow label="Primary Color" description="Main brand color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e. target.value })}
              className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
            <code className="text-sm text-zinc-400 font-mono bg-zinc-800 px-2 py-1 rounded">{settings.primaryColor}</code>
          </div>
        </SettingsRow>
        <SettingsRow label="Secondary Color" description="Supporting color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => onUpdate({ secondaryColor:  e.target.value })}
              className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
            <code className="text-sm text-zinc-400 font-mono bg-zinc-800 px-2 py-1 rounded">{settings.secondaryColor}</code>
          </div>
        </SettingsRow>
        <SettingsRow label="Accent Color" description="Highlights and CTAs">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => onUpdate({ accentColor:  e.target.value })}
              className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
            <code className="text-sm text-zinc-400 font-mono bg-zinc-800 px-2 py-1 rounded">{settings.accentColor}</code>
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Theme" description="Dark/light mode settings">
        <SettingsRow label="Default to Dark Mode" description="New users will see dark mode by default">
          <Toggle checked={settings. darkModeDefault} onChange={(v) => onUpdate({ darkModeDefault: v })} />
        </SettingsRow>
        <SettingsRow label="Allow Theme Toggle" description="Let users switch between light and dark mode">
          <Toggle checked={settings.allowUserThemeToggle} onChange={(v) => onUpdate({ allowUserThemeToggle:  v })} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Login Page" description="Customize the login experience">
        <SettingsRow label="Welcome Text" description="Text shown on login page">
          <TextInput value={settings.loginWelcomeText || ""} onChange={(v) => onUpdate({ loginWelcomeText: v })} placeholder="Welcome back!" className="w-64" />
        </SettingsRow>
        <SettingsRow label="Background Image" description="Custom login page background">
          <Button variant="secondary" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Footer" description="Platform footer content">
        <SettingsRow label="Footer Text">
          <TextInput value={settings.footerText || ""} onChange={(v) => onUpdate({ footerText: v })} placeholder="© 2025 Your Company" className="w-80" />
        </SettingsRow>
        <SettingsRow label="Show 'Powered By'" description="Display Aeon branding in footer">
          <Toggle checked={settings. showPoweredBy} onChange={(v) => onUpdate({ showPoweredBy:  v })} />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function EventSettingsTab({
  settings,
  onUpdate,
}:  {
  settings:  SystemSettings["events"];
  onUpdate:  (updates: Partial<SystemSettings["events"]>) => void;
}) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#8B5CF6" });

  const addCategory = () => {
    if (newCategory.name) {
      onUpdate({
        eventCategories: [
          ...settings. eventCategories,
          { id: newCategory.name. toLowerCase().replace(/\s+/g, "_"), ...newCategory },
        ],
      });
      setNewCategory({ name: "", color: "#8B5CF6" });
      setShowCategoryModal(false);
    }
  };

  const removeCategory = (id: string) => {
    onUpdate({ eventCategories: settings.eventCategories. filter((c) => c.id !== id) });
  };

  return (
    <div className="space-y-8">
      <SettingsSection title="Approval Settings" description="Control event approval workflow">
        <SettingsRow label="Require Event Approval" description="Events must be approved before publishing">
          <Toggle checked={settings.requireApproval} onChange={(v) => onUpdate({ requireApproval: v })} />
        </SettingsRow>
        {settings.requireApproval && (
          <SettingsRow label="Auto-Approve for Leaders" description="Community leaders can publish events without approval">
            <Toggle checked={settings. autoApproveForLeaders} onChange={(v) => onUpdate({ autoApproveForLeaders: v })} />
          </SettingsRow>
        )}
      </SettingsSection>

      <SettingsSection title="Registration Settings" description="Default settings for event registrations">
        <SettingsRow label="Default Max Attendees" description="Default limit for new events">
          <NumberInput value={settings.maxAttendeesDefault} onChange={(v) => onUpdate({ maxAttendeesDefault:  v })} min={1} max={10000} suffix="attendees" />
        </SettingsRow>
        <SettingsRow label="Allow Waitlist" description="Enable waitlist when events are full">
          <Toggle checked={settings.allowWaitlist} onChange={(v) => onUpdate({ allowWaitlist: v })} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Event Features" description="Enable or disable event features">
        <SettingsRow label="Allow Comments" description="Let attendees comment on events">
          <Toggle checked={settings.allowEventComments} onChange={(v) => onUpdate({ allowEventComments: v })} />
        </SettingsRow>
        <SettingsRow label="Allow Ratings" description="Let attendees rate events after attending">
          <Toggle checked={settings.allowEventRatings} onChange={(v) => onUpdate({ allowEventRatings: v })} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Event Categories" description="Manage categories for events">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {settings.eventCategories. map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg group">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-zinc-300 flex-1">{cat.name}</span>
                <button
                  onClick={() => removeCategory(cat.id)}
                  className="p-1 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3. 5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowCategoryModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </SettingsSection>

      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Add Event Category" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Category Name</label>
            <TextInput value={newCategory.name} onChange={(v) => setNewCategory({ ...newCategory, name: v })} placeholder="e.g., Webinar" className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
              />
              <code className="text-sm text-zinc-400 font-mono">{newCategory.color}</code>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={addCategory} disabled={!newCategory.name}>
              Add Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MemberSettingsTab({
  settings,
  onUpdate,
}:  {
  settings:  SystemSettings["members"];
  onUpdate:  (updates: Partial<SystemSettings["members"]>) => void;
}) {
  return (
    <div className="space-y-8">
      <SettingsSection title="Registration" description="Control how members join">
        <SettingsRow label="Allow Self-Registration" description="Members can sign up on their own">
          <Toggle checked={settings.allowSelfRegistration} onChange={(v) => onUpdate({ allowSelfRegistration: v })} />
        </SettingsRow>
        {settings.allowSelfRegistration && (
          <>
            <SettingsRow label="Require Email Verification" description="New members must verify their email">
              <Toggle checked={settings. requireEmailVerification} onChange={(v) => onUpdate({ requireEmailVerification: v })} />
            </SettingsRow>
            <SettingsRow label="Require Admin Approval" description="New registrations require admin approval">
              <Toggle checked={settings.requireAdminApproval} onChange={(v) => onUpdate({ requireAdminApproval:  v })} />
            </SettingsRow>
          </>
        )}
      </SettingsSection>

      <SettingsSection title="Profile Settings" description="Member profile configuration">
        <SettingsRow label="Allow Profile Editing" description="Members can edit their own profile">
          <Toggle checked={settings. allowProfileEditing} onChange={(v) => onUpdate({ allowProfileEditing: v })} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Member Directory" description="Member discovery settings">
        <SettingsRow label="Show Member Directory" description="Display a list of all members">
          <Toggle checked={settings.showMemberDirectory} onChange={(v) => onUpdate({ showMemberDirectory: v })} />
        </SettingsRow>
        {settings.showMemberDirectory && (
          <SettingsRow label="Allow Member Search" description="Let members search for other members">
            <Toggle checked={settings.allowMemberSearch} onChange={(v) => onUpdate({ allowMemberSearch: v })} />
          </SettingsRow>
        )}
      </SettingsSection>
    </div>
  );
}

function IntegrationSettingsTab({
  settings,
  onUpdate,
}: {
  settings: SystemSettings["integrations"];
  onUpdate: (updates:  Partial<SystemSettings["integrations"]>) => void;
}) {
  const integrations = [
    {
      id: "google-calendar",
      name:  "Google Calendar",
      description: "Sync events with Google Calendar",
      icon: Calendar,
      enabled: settings.googleCalendarEnabled,
      onToggle: (v:  boolean) => onUpdate({ googleCalendarEnabled: v }),
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      id: "outlook",
      name: "Outlook Calendar",
      description:  "Sync events with Outlook/Microsoft 365",
      icon: Calendar,
      enabled: settings. outlookCalendarEnabled,
      onToggle: (v:  boolean) => onUpdate({ outlookCalendarEnabled: v }),
      color: "text-blue-400",
      bgColor:  "bg-blue-500/10",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send notifications to Slack channels",
      icon:  MessageSquare,
      enabled: settings.slackEnabled,
      onToggle: (v: boolean) => onUpdate({ slackEnabled: v }),
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "teams",
      name:  "Microsoft Teams",
      description: "Send notifications to Teams channels",
      icon: MessageSquare,
      enabled: settings.teamsEnabled,
      onToggle: (v: boolean) => onUpdate({ teamsEnabled: v }),
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
    {
      id: "analytics",
      name:  "Google Analytics",
      description: "Track platform usage and metrics",
      icon:  BarChart3,
      enabled:  settings.googleAnalyticsEnabled,
      onToggle: (v: boolean) => onUpdate({ googleAnalyticsEnabled: v }),
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ];

  const storageProviders = [
    { id: "local", name: "Local Storage", icon: HardDrive, description: "Store files on the server" },
    { id: "s3", name: "Amazon S3", icon:  Cloud, description: "Store files in AWS S3" },
    { id: "azure", name: "Azure Blob", icon: Cloud, description: "Store files in Azure Blob Storage" },
    { id: "gcs", name: "Google Cloud", icon: Cloud, description: "Store files in Google Cloud Storage" },
  ];

  return (
    <div className="space-y-8">
      <SettingsSection title="Connected Services" description="Integrate with third-party services">
        <div className="p-4 grid gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration. id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  integration.enabled ?  "bg-white/5 border-white/10" : "bg-zinc-900/30 border-white/5"
                )}
              >
                <div className={cn("p-3 rounded-xl", integration.bgColor)}>
                  <Icon className={cn("h-6 w-6", integration.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-zinc-200">{integration.name}</h4>
                    {integration.enabled && (
                      <Badge variant="success" className="text-[10px]">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{integration.description}</p>
                </div>
                <Toggle checked={integration.enabled} onChange={integration.onToggle} />
              </div>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection title="File Storage" description="Where uploaded files are stored">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {storageProviders. map((provider) => {
              const Icon = provider.icon;
              const isSelected = settings.storageProvider === provider. id;
              return (
                <button
                  key={provider.id}
                  onClick={() => onUpdate({ storageProvider: provider.id as any })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    isSelected
                      ? "bg-violet-500/10 border-violet-500/30"
                      :  "bg-zinc-900/30 border-white/5 hover:border-white/10"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isSelected ? "text-violet-400" : "text-zinc-500")} />
                  <div>
                    <p className={cn("text-sm font-medium", isSelected ? "text-violet-300" : "text-zinc-300")}>
                      {provider.name}
                    </p>
                    <p className="text-xs text-zinc-500">{provider.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}

function BackupSettingsTab({
  settings,
  onUpdate,
}: {
  settings: SystemSettings["backups"];
  onUpdate: (updates:  Partial<SystemSettings["backups"]>) => void;
}) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    onUpdate({
      lastBackupAt: new Date().toISOString(),
      lastBackupSize: "2. 5 GB",
      lastBackupStatus: "success",
    });
    setIsBackingUp(false);
  };

  const formatBackupTime = (timestamp?:  string) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year:  "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Last Backup Status */}
      <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-2xl border border-white/5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-4 rounded-2xl",
                settings.lastBackupStatus === "success" ?  "bg-emerald-500/10" : "bg-red-500/10"
              )}
            >
              <Database
                className={cn("h-8 w-8", settings.lastBackupStatus === "success" ? "text-emerald-400" :  "text-red-400")}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-100">Last Backup</h3>
              <p className="text-sm text-zinc-500 mt-1">{formatBackupTime(settings.lastBackupAt)}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      settings. lastBackupStatus === "success" ? "bg-emerald-400" : "bg-red-400"
                    )}
                  />
                  <span
                    className={cn("text-sm", settings.lastBackupStatus === "success" ? "text-emerald-400" :  "text-red-400")}
                  >
                    {settings.lastBackupStatus === "success" ? "Successful" : "Failed"}
                  </span>
                </div>
                {settings.lastBackupSize && (
                  <span className="text-sm text-zinc-500">
                    Size: <span className="text-zinc-300">{settings.lastBackupSize}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleManualBackup} isLoading={isBackingUp}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isBackingUp && "animate-spin")} />
              Backup Now
            </Button>
            <Button variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <SettingsSection title="Automatic Backups" description="Schedule automatic backups">
        <SettingsRow label="Enable Auto Backup" description="Automatically backup your data">
          <Toggle checked={settings.autoBackupEnabled} onChange={(v) => onUpdate({ autoBackupEnabled:  v })} />
        </SettingsRow>
        {settings.autoBackupEnabled && (
          <>
            <SettingsRow label="Backup Frequency" description="How often to run backups">
              <div className="flex gap-2">
                {(["daily", "weekly", "monthly"] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => onUpdate({ backupFrequency:  freq })}
                    className={cn(
                      "px-4 py-2 text-sm rounded-lg border transition-colors capitalize",
                      settings.backupFrequency === freq
                        ? "bg-white text-black border-white"
                        : "bg-zinc-800 text-zinc-400 border-white/10 hover:border-white/20"
                    )}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow label="Backup Time" description="When to run the backup (server time)">
              <input
                type="time"
                value={settings.backupTime}
                onChange={(e) => onUpdate({ backupTime:  e.target.value })}
                className="bg-zinc-800 border border-white/10 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </SettingsRow>
            <SettingsRow label="Retention Period" description="How long to keep backups">
              <NumberInput
                value={settings.backupRetentionDays}
                onChange={(v) => onUpdate({ backupRetentionDays: v })}
                min={7}
                max={365}
                suffix="days"
              />
            </SettingsRow>
          </>
        )}
      </SettingsSection>

      <SettingsSection title="Backup Storage" description="Where backups are stored">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id:  "local", name:  "Local Storage", icon: HardDrive },
              { id:  "s3", name: "Amazon S3", icon: Cloud },
              { id:  "azure", name:  "Azure Blob", icon: Cloud },
              { id: "gcs", name:  "Google Cloud", icon: Cloud },
            ].map((provider) => {
              const Icon = provider.icon;
              const isSelected = settings.backupLocation === provider.id;
              return (
                <button
                  key={provider. id}
                  onClick={() => onUpdate({ backupLocation:  provider.id as any })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    isSelected
                      ?  "bg-violet-500/10 border-violet-500/30"
                      : "bg-zinc-900/30 border-white/5 hover:border-white/10"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isSelected ? "text-violet-400" : "text-zinc-500")} />
                  <span className={cn("text-sm font-medium", isSelected ? "text-violet-300" :  "text-zinc-300")}>
                    {provider.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Restore" description="Restore from a previous backup">
        <div className="p-6">
          <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Warning</p>
              <p className="text-xs text-amber-400/70 mt-1">
                Restoring from a backup will replace all current data. This action cannot be undone. 
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">
              <Upload className="h-4 w-4 mr-2" />
              Upload Backup File
            </Button>
            <Button variant="secondary" className="text-amber-400 hover: bg-amber-500/10" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restore from Latest
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}