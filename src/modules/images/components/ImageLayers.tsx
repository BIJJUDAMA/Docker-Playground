"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, AlertCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface LayerItem {
  id: number;
  instruction: string;
  desc: string;
  size: string;
  type: string;
}

const LAYERS: LayerItem[] = [
  { id: 4, instruction: 'CMD ["python", "app.py"]', type: "Metadata Layer", desc: "Sets the default entrypoint command to run when the container boots. This layer does not copy filesystem assets, consuming 0 bytes of storage.", size: "0 B" },
  { id: 3, instruction: "COPY . /app", type: "Source Code Layer", desc: "Copies source code scripts and assets from the local host workspace directory into the container image filesystem.", size: "2.4 MB" },
  { id: 2, instruction: "RUN pip install -r reqs.txt", type: "Dependency installation Layer", desc: "Runs dependency package installers during compilation, writing package binaries to system site-packages.", size: "84.2 MB" },
  { id: 1, instruction: "FROM python:3.10-alpine", type: "Base OS Runtime Layer", desc: "Provides the underlying minimal Linux alpine operating system base environment alongside the pre-built Python interpreter runtime.", size: "52.8 MB" }
];

export default function ImageLayers() {
  const [activeLayerId, setActiveLayerId] = useState<number>(3);

  const activeLayer = LAYERS.find(l => l.id === activeLayerId) || LAYERS[0];

  return (
    <VisualCanvas
      objective="Explore how Docker builds images in stacked, read-only layers to compose an immutable filesystem blueprint."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is an Image Layer Stack?
          </div>
          <p>
            An image is composed of read-only filesystem layers. Each instruction in a Dockerfile adds a new immutable layer to the stack.
          </p>
          <p>
            This layer-based architecture allows layers to be shared between different images in memory, reducing storage overhead.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Visual Layer Stack (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
            Image Layers Stack
          </h4>

          <div className="w-full max-w-md flex flex-col gap-2 relative">
            {LAYERS.map((layer) => {
              const isActive = activeLayerId === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={cn(
                    "p-3.5 rounded-[12px] border text-left flex items-center justify-between transition-all duration-300 relative overflow-hidden cursor-pointer",
                    isActive 
                      ? "bg-zinc-800 border-zinc-700 text-white scale-[1.01] shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                      : "bg-[#0d0d0e] border-zinc-850 hover:bg-zinc-900/40 text-zinc-350"
                  )}
                >
                  <div className="flex flex-col gap-0.5 pr-4 select-text">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                      Layer {layer.id} · {layer.size}
                    </span>
                    <span className={cn(
                      "text-xs font-bold font-mono tracking-tight",
                      isActive ? "text-white" : "text-zinc-200"
                    )}>
                      {layer.instruction}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-normal leading-normal mt-0.5">
                      {layer.desc}
                    </span>
                  </div>

                  <div className="shrink-0 font-mono text-[8px] font-bold uppercase select-none">
                    <span className={cn(
                      "px-2 py-0.5 rounded border text-[8px]",
                      isActive 
                        ? "bg-white text-black border-white" 
                        : "bg-[#0d0d0e] text-zinc-500 border-zinc-800"
                    )}>
                      {layer.size === "0 B" ? "metadata" : "readonly"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Layer details sidebar (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              {activeLayer.type}
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">
              Layer {activeLayer.id} Details
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {activeLayer.desc}
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] text-left flex items-start gap-2 flex-1 select-text font-sans">
            <AlertCircle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
            <div className="text-[9px] text-zinc-450 leading-relaxed font-normal">
              Click on each layer in the build stack to inspect its instruction context, filesystem characteristics, and size footprint.
            </div>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
