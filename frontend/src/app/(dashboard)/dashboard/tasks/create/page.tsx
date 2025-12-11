import { Metadata } from "next";
import { CreateTaskForm } from "@/components/tasks/create-task-form";

export const metadata: Metadata = {
  title: "Create Task - Aeon",
  description: "Create a new task",
};

export default function CreateTaskPage() {
  return <CreateTaskForm />;
}