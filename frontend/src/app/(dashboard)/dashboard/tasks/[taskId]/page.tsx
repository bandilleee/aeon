import { Metadata } from "next";
import { TaskDetails } from "@/components/tasks/task-details";

export const metadata: Metadata = {
  title: "Task Details - Aeon",
  description: "View task details",
};

interface TaskPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = await params;
  return <TaskDetails taskId={taskId} />;
}