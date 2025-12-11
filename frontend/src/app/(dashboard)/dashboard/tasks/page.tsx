import { Metadata } from "next";
import { TasksList } from "@/components/tasks/tasks-list";

export const metadata: Metadata = {
  title: "Tasks - Aeon",
  description: "Manage your tasks",
};

export default function TasksPage() {
  return <TasksList />;
}