import { Metadata } from "next";
import { TwoFactorBackupCodes } from "@/components/forms/two-factor-backup-codes";

export const metadata:  Metadata = {
  title: "Backup Codes - Aeon",
  description: "Save your backup codes",
};

export default function BackupCodesPage() {
  return <TwoFactorBackupCodes />;
}