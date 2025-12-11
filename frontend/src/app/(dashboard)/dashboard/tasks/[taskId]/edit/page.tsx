import { Metadata } from "next";
import { EditTaskForm } from "@/components/tasks/edit-task-form";

export const metadata: Metadata = {
  title: "Edit Task - Aeon",
  description: "Edit your task",
};

interface EditTaskPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { taskId } = await params;
  return <EditTaskForm taskId={taskId} />;
}