"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal, LayoutDashboard, Calendar, CheckSquare, Users, Settings, 
  ChevronLeft, ChevronRight, ChevronsUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface NavItem {
  title: string; href: string; icon: React.ElementType; badge?: string | number;
}
interface NavSection {
  title: string; items: NavItem[];
}

// ONLY User Navigation Sections
const userNavSections: NavSection[] = [
  {
    title: "Platform",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Events", href: "/dashboard/events", icon: Calendar },
      { title: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { title: "Members", href: "/dashboard/members", icon: Users },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Real Auth Context!
  const { user } = useAuth();

  // Dynamic user data
  const displayName = user?.displayName || user?.name || user?.email?.split('@')[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  const avatarUrl = user?.avatarUrl;
  const plan = "Pro Plan"; // Placeholder

  return (
    <aside className={cn("hidden md:flex flex-col border-r border-white/5 bg-zinc-950/30 h-screen sticky top-0 transition-all duration-300", isCollapsed ? "w-[68px]" : "w-64")}>
      
      {/* Logo */}
      <div className={cn("p-4 flex items-center gap-3 mb-2", isCollapsed ? "justify-center" : "px-6")}>
        <div className="w-8 h-8 bg-white/5 rounded border border-white/10 flex items-center justify-center text-white shadow-lg shadow-black/50 flex-shrink-0">
          <Terminal className="h-4 w-4" strokeWidth={1.5} />
        </div>
        {!isCollapsed && <span className="text-zinc-100 font-semibold tracking-tight text-sm">AEON</span>}
      </div>

      {/* Navigation - NOW STRICTLY USER ROUTES */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        {userNavSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && <div className="px-2 mb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">{section.title}</div>}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href} href={item.href} title={isCollapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-all group relative",
                      isActive ? "text-zinc-100 bg-white/5 shadow-sm shadow-black/20 ring-1 ring-white/5" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 flex-shrink-0 transition-colors", isActive ? "text-white" : "group-hover:text-white")} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-zinc-300 rounded">{item.badge}</span>}
                      </>
                    )}

                    {isCollapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-medium bg-white text-black rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="px-3 py-2">
        <button onClick={() => setIsCollapsed(!isCollapsed)} className={cn("flex items-center gap-2 w-full px-2 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-md transition-colors", isCollapsed && "justify-center")}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* Dynamic User Section */}
      <div className="p-3 border-t border-white/5">
        <Link href="/dashboard/settings">
          <button className={cn("flex items-center gap-3 w-full p-2 rounded-md hover:bg-white/5 transition-colors", isCollapsed && "justify-center")}>
            
            {/* Dynamic Sidebar Avatar */}
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] text-white font-bold border border-white/10 flex-shrink-0">
                {initials}
              </div>
            )}

            {!isCollapsed && (
              <>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-xs text-zinc-200 font-medium truncate w-full">{displayName}</span>
                  <span className="text-[10px] text-zinc-500 truncate w-full">{plan}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-zinc-600 flex-shrink-0" />
              </>
            )}
          </button>
        </Link>
      </div>

    </aside>
  );
}