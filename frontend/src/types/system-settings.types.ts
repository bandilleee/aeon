/**
 * System Settings Types
 * Comprehensive platform configuration
 */

/**
 * General platform settings
 */
export interface GeneralSettings {
  platformName: string;
  platformDescription: string;
  platformLogo?:  string;
  platformFavicon?: string;
  timezone:  string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  language: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  // Password policies
  minPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase:  boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  preventPasswordReuse: number;
  // Session settings
  sessionTimeout:  number;
  maxConcurrentSessions:  number;
  // 2FA settings
  twoFactorRequired: boolean;
  twoFactorGracePeriodDays: number;
  // Login settings
  maxLoginAttempts: number;
  lockoutDuration: number;
  // IP settings
  ipWhitelistEnabled:  boolean;
  ipWhitelist: string[];
  ipBlacklistEnabled: boolean;
  ipBlacklist: string[];
}

/**
 * Email/notification settings
 */
export interface NotificationSettings {
  // Email configuration
  emailProvider: "smtp" | "sendgrid" | "mailgun" | "ses";
  smtpHost?:  string;
  smtpPort?:  number;
  smtpUsername?: string;
  smtpPassword?:  string;
  smtpSecure?: boolean;
  sendgridApiKey?: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;
  sesRegion?: string;
  sesAccessKey?: string;
  sesSecretKey?:  string;
  // Email settings
  fromEmail:  string;
  fromName: string;
  replyToEmail?:  string;
  // Notification toggles
  emailNotificationsEnabled: boolean;
  welcomeEmailEnabled: boolean;
  passwordResetEmailEnabled:  boolean;
  eventReminderEmailEnabled: boolean;
  eventApprovalEmailEnabled:  boolean;
  taskAssignmentEmailEnabled:  boolean;
  weeklyDigestEnabled: boolean;
}

/**
 * Appearance/branding settings
 */
export interface AppearanceSettings {
  // Colors
  primaryColor:  string;
  secondaryColor: string;
  accentColor: string;
  // Theme
  darkModeDefault: boolean;
  allowUserThemeToggle: boolean;
  // Branding
  showPoweredBy: boolean;
  customCss?: string;
  // Login page
  loginBackgroundImage?: string;
  loginWelcomeText?: string;
  // Footer
  footerText?: string;
  footerLinks:  { label: string; url:  string }[];
}

/**
 * Event settings
 */
export interface EventSettings {
  requireApproval: boolean;
  autoApproveForLeaders: boolean;
  maxAttendeesDefault: number;
  allowWaitlist: boolean;
  reminderHoursBefore: number[];
  allowEventComments: boolean;
  allowEventRatings: boolean;
  eventCategories: { id: string; name:  string; color: string }[];
}

/**
 * Member settings
 */
export interface MemberSettings {
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  requireAdminApproval:  boolean;
  defaultRole: string;
  profileFieldsRequired: string[];
  allowProfileEditing: boolean;
  showMemberDirectory: boolean;
  allowMemberSearch: boolean;
}

/**
 * Integration settings
 */
export interface IntegrationSettings {
  // Calendar
  googleCalendarEnabled: boolean;
  googleCalendarClientId?: string;
  googleCalendarApiKey?: string;
  outlookCalendarEnabled: boolean;
  outlookCalendarClientId?: string;
  // Communication
  slackEnabled: boolean;
  slackWebhookUrl?: string;
  slackBotToken?: string;
  teamsEnabled: boolean;
  teamsWebhookUrl?: string;
  // Analytics
  googleAnalyticsEnabled:  boolean;
  googleAnalyticsId?: string;
  // Storage
  storageProvider: "local" | "s3" | "azure" | "gcs";
  s3Bucket?: string;
  s3Region?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  azureConnectionString?: string;
  azureContainer?: string;
  gcsProjectId?: string;
  gcsBucket?: string;
}

/**
 * Backup settings
 */
export interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupTime: string;
  backupRetentionDays:  number;
  backupLocation:  "local" | "s3" | "azure" | "gcs";
  lastBackupAt?: string;
  lastBackupSize?: string;
  lastBackupStatus?: "success" | "failed";
}

/**
 * All system settings combined
 */
export interface SystemSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  events: EventSettings;
  members: MemberSettings;
  integrations: IntegrationSettings;
  backups: BackupSettings;
}

/**
 * Settings section for navigation
 */
export interface SettingsSection {
  id:  string;
  label: string;
  icon:  string;
  description: string;
}