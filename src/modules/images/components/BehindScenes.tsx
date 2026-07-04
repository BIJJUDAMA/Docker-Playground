"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import DockerPull from "./DockerPull";
import CopyOnWrite from "./CopyOnWrite";
import OverlayDriver from "./OverlayDriver";

const ADV_TABS = [
  { id: "pull", label: "Image Pull sequence" },
  { id: "cow", label: "Copy-on-Write (CoW)" },
  { id: "overlay", label: "Overlay2 storage View" }
];

export default function BehindScenes() {
  const [activeAdvTab, setActiveAdvTab] = useState<string>("pull");

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent font-sans">
      
      {/* Sub-navigation bar inside Behind the Scenes */}
      <div className="px-4 py-1.5 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0 bg-zinc-900/10">
        {ADV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdvTab(tab.id)}
            className={cn(
              "text-[10px] font-bold py-1.5 px-3 rounded-[6px] transition-all whitespace-nowrap focus:outline-none cursor-pointer border",
              activeAdvTab === tab.id
                ? "bg-zinc-800 text-white border-zinc-700 font-bold"
                : "bg-transparent text-zinc-550 border-transparent hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render selected advanced visualizer */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeAdvTab === "pull" && <DockerPull />}
        {activeAdvTab === "cow" && <CopyOnWrite />}
        {activeAdvTab === "overlay" && <OverlayDriver />}
      </div>

    </div>
  );
}
