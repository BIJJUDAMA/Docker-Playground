"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useModuleStore } from "@/stores/moduleStore";
import { modules } from "@/data/modules";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export default function Sidebar() {
  const params = useParams();
  const activeSlug = (params.slug as string) || null;
  const { completedModules } = useModuleStore();

  return (
    <aside className="w-80 border-r border-white/10 bg-zinc-950/70 backdrop-blur-md flex flex-col h-[calc(100vh-73px)] sticky top-[73px] overflow-hidden hidden md:flex shrink-0">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Learning Paths
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {modules.map((module) => {
          // Dynamically resolve icon with safe casting
          const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[module.icon] || Icons.HelpCircle;
          const isActive = activeSlug === module.slug;
          const isCompleted = completedModules.includes(module.slug);

          return (
            <Link
              key={module.slug}
              href={`/modules/${module.slug}`}
              className={cn(
                "group flex items-start gap-3.5 p-3.5 rounded-xl transition-all duration-300 relative overflow-hidden border",
                isActive 
                  ? "bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border-cyan-500/30 text-white shadow-md shadow-cyan-950/20"
                  : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              )}
            >
              {/* Left active border highlight */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-md" />
              )}

              {/* Icon Container */}
              <div 
                className={cn(
                  "p-2 rounded-lg transition-colors duration-300",
                  isActive 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-zinc-300"
                )}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "text-xs font-medium uppercase tracking-wider block mb-0.5",
                    isActive ? "text-cyan-400" : "text-zinc-500"
                  )}>
                    Module 0{module.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                  )}
                </div>
                
                <h3 className="text-sm font-semibold truncate tracking-tight">
                  {module.title}
                </h3>
                
                <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5 font-normal">
                  {module.visualizationCount} Visualizations
                </p>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Sidebar Footer / Quick Reset */}
      <div className="p-4 border-t border-white/5 bg-zinc-900/20">
        <p className="text-[10px] text-zinc-500 leading-normal">
          Completed modules are saved in workspace cache automatically.
        </p>
      </div>
    </aside>
  );
}
