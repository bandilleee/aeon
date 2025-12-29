export interface LeaderProfileSettings {
  displayName: string;
  email: string;
  phone: string;
  bio?: string;
  avatarUrl?: string;
}
export interface LeaderSecuritySettings {
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}
export interface LeaderNotificationSettings {
  emailNotifications: boolean;
  eventNotifications: boolean;
  taskNotifications: boolean;
  memberNotifications: boolean;
}