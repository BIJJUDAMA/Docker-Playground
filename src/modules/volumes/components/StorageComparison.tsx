"use client";

import React, { useState } from "react";
import { HardDrive, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface ComparisonRow {
  id: string;
  name: string;
  location: string;
  persistence: string;
  portability: string;
  useCase: string;
  scoreCard: {
    persistence: number; // 1-5
    performance: number; // 1-5
    portability: number; // 1-5
  };
  details: string;
}

const COMPARISONS: ComparisonRow[] = [
  {
    id: "ephemeral",
    name: "Container Layer",
    location: "UpperDir (Writable Layer)",
    persistence: "None (crashes/deletes purge it)",
    portability: "None (locked to instance process)",
    useCase: "Temp logs, scratch cache files",
    scoreCard: { persistence: 1, performance: 4, portability: 1 },
    details: "Writes to the container's thin writable layer utilize the copy-on-write storage driver (e.g., overlay2). This incurs slight CPU write overhead and is destroyed completely when the container is deleted."
  },
  {
    id: "volume",
    name: "Named Volume",
    location: "Docker managed (/var/lib/docker/)",
    persistence: "Persistent (survives removals)",
    portability: "High (handled via Docker API/CLI)",
    useCase: "Databases, state config files",
    scoreCard: { persistence: 5, performance: 5, portability: 5 },
    details: "Named volumes are created and isolated inside Docker Engine storage limits. They run at native host disk write speeds, can be shared across multiple containers, and can only be deleted by explicit CLI request (docker volume rm)."
  },
  {
    id: "bind",
    name: "Bind Mount",
    location: "Custom Host Directory (e.g., /app/src)",
    persistence: "Persistent (survives removals)",
    portability: "Low (tied to host absolute paths)",
    useCase: "Source code hot-reloading in Dev",
    scoreCard: { persistence: 5, performance: 5, portability: 2 },
    details: "Bind mounts map a specific absolute directory path on the host computer directly into the container directory. Excellent for hot-reloading code during dev, but bad for production as paths differ across operating systems."
  }
];

export default function StorageComparison() {
  const [selectedId, setSelectedId] = useState<string>("volume");

  const activeRow = COMPARISONS.find((c) => c.id === selectedId) || COMPARISONS[1];

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            className={cn(
              "text-[9px] font-mono select-none",
              i < score ? "text-white" : "text-zinc-800"
            )}
          >
            ●
          </span>
        ))}
      </div>
    );
  };

  return (
    <VisualCanvas
      objective="Compare the structural differences, data persistence, and use cases of container mount options."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Volume mount options guide
          </div>
          <p>
            By default, container filesystems are ephemeral. **Volumes** decouple storage from container lifecycles. **Named Volumes** are best for databases as Docker manages filesystems directly. **Bind Mounts** link to host directories, making them ideal for dev source code syncs.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Storage comparison matrix table (Left) */}
        <div className="flex-1 flex flex-col justify-start p-5 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[300px] overflow-x-auto custom-scrollbar">
          <h4 className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest mb-4">
            Storage Mounting Matrix
          </h4>

          <table className="w-full text-left text-[10px] border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-550 font-mono font-bold uppercase tracking-wider">
                <th className="py-2.5 px-2">Mount Type</th>
                <th className="py-2.5 px-2">Host Location</th>
                <th className="py-2.5 px-2">Data Persistence</th>
                <th className="py-2.5 px-2">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((row) => {
                const isActive = selectedId === row.id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={cn(
                      "border-b border-zinc-850/50 cursor-pointer transition-colors hover:bg-zinc-855/20",
                      isActive ? "bg-zinc-800/30 text-zinc-150 font-bold animate-fadeIn" : "text-zinc-450"
                    )}
                  >
                    <td className="py-3.5 px-2 font-semibold flex items-center gap-1.5 font-sans">
                      <HardDrive className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-zinc-600")} />
                      {row.name}
                    </td>
                    <td className="py-3.5 px-2 font-mono text-[9px] truncate max-w-[130px]">{row.location}</td>
                    <td className="py-3.5 px-2">{row.persistence}</td>
                    <td className="py-3.5 px-2 truncate max-w-[140px] font-sans">{row.useCase}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Row Detail Inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Mount Option Inspector
            </span>
            <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 font-sans">
              {activeRow.name}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {activeRow.details}
            </p>
          </div>

          {/* Performance Radar scores */}
          <div className="space-y-2 pt-3 border-t border-zinc-850 select-text">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 block">
              Capabilities Score
            </span>
            <div className="flex flex-col gap-2 text-[9.5px] font-sans">
              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Data Persistence:</span>
                {renderStars(activeRow.scoreCard.persistence)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Read/Write Speed:</span>
                {renderStars(activeRow.scoreCard.performance)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-450">Host Portability:</span>
                {renderStars(activeRow.scoreCard.portability)}
              </div>
            </div>
          </div>

          {/* Concept summary tip */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 text-[10px] text-zinc-450 leading-relaxed mt-auto select-text font-sans">
            <span className="font-bold block mb-0.5 text-zinc-200">Architectural Note:</span>
            {activeRow.id === "volume" && "Named volumes are isolated from direct host writes, keeping files safe from accidental deletions or system permission lockups."}
            {activeRow.id === "bind" && "Avoid bind mounts in production! If directory structures or permission hashes mismatch across cloud clusters, the build will crash."}
            {activeRow.id === "ephemeral" && "Store state outside container boundaries. Any writes inside ephemeral layers are permanently lost when container instances are rebuilt."}
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
