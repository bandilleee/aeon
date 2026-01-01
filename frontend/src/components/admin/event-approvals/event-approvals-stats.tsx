import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EventApprovalsStats({ stats }: { stats: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-zinc-950 border border-white/5 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-semibold text-zinc-100">{stat.value}</p>
              <p className={`text-xs mt-1 ${
                stat.changeType === "positive"
                  ? "text-emerald-500"
                  : stat.changeType === "negative"
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}>
                {stat.change}
              </p>
            </div>
            <div className={cn("p-3 rounded-lg", stat.iconColor)}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}