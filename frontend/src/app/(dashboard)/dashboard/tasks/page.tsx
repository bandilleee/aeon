import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks - Aeon",
  description: "Manage your tasks",
};

export default function TasksPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold text-white mb-2">Tasks</h1>
      <p className="text-zinc-500">Tasks module coming soon... </p>
    </div>
  );
}