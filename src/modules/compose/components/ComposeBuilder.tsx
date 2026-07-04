"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus, Layers, HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

interface ServiceConfig {
  id: string;
  name: string;
  image: string;
  ports?: string;
  env?: string[];
  dependsOn?: string[];
}

const AVAILABLE_SERVICES: Record<string, ServiceConfig> = {
  web: {
    id: "web",
    name: "web-server",
    image: "nginx:alpine",
    ports: "80:80",
    dependsOn: ["api"]
  },
  api: {
    id: "api",
    name: "node-api",
    image: "node:18-alpine",
    ports: "3000:3000",
    env: ["DATABASE_URL=postgres://db:5432/app"],
    dependsOn: ["db"]
  },
  db: {
    id: "db",
    name: "postgres-db",
    image: "postgres:15-alpine",
    env: ["POSTGRES_DB=app", "POSTGRES_PASSWORD=secret"]
  },
  redis: {
    id: "redis",
    name: "redis-cache",
    image: "redis:7-alpine"
  }
};

export default function ComposeBuilder() {
  const [activeServices, setActiveServices] = useState<string[]>(["web", "api", "db"]);

  const toggleService = (id: string) => {
    if (activeServices.includes(id)) {
      setActiveServices(activeServices.filter((s) => s !== id));
    } else {
      setActiveServices([...activeServices, id]);
    }
  };

  const getComposeYaml = () => {
    let yaml = `version: "3.8"\n\nservices:`;

    activeServices.forEach((id) => {
      const s = AVAILABLE_SERVICES[id];
      yaml += `\n  ${s.id}:\n    image: ${s.image}`;
      
      if (s.ports) {
        yaml += `\n    ports:\n      - "${s.ports}"`;
      }
      
      if (s.env) {
        yaml += `\n    environment:`;
        s.env.forEach((e) => {
          yaml += `\n      - ${e}`;
        });
      }

      // Calculate depends_on based on active services only
      const activeDeps = s.dependsOn?.filter(dep => activeServices.includes(dep));
      if (activeDeps && activeDeps.length > 0) {
        yaml += `\n    depends_on:`;
        activeDeps.forEach((dep) => {
          yaml += `\n      - ${dep}`;
        });
      }
    });

    return yaml;
  };

  return (
    <VisualCanvas
      objective="Compose multiple application containers, subnets, and dependency parameters inside a unified compose.yaml configuration."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is Docker Compose?
          </div>
          <p>
            Instead of running `docker run` commands manually for every container, Docker Compose compiles your stack configurations inside a single YAML file.
          </p>
          <p>
            Running `docker compose up` starts all services, maps ports, binds shared volumes, builds custom bridge network loops, and manages startup orders automatically.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Dynamic code editor box (Left) */}
        <div className="flex-1 flex flex-col rounded-[18px] border border-zinc-800/40 bg-[#121214] overflow-hidden relative shadow-sm min-h-[300px]">
          <div className="bg-[#1a1a1e] px-4 py-2 border-b border-zinc-800/30 flex items-center shrink-0">
            <span className="text-[8px] font-mono text-zinc-500 font-bold">compose.yaml</span>
          </div>

          <div className="flex-1 p-5 font-mono text-[9.5px] leading-relaxed bg-[#0d0d0e] text-zinc-400 select-text overflow-y-auto custom-scrollbar">
            <pre className="whitespace-pre">{getComposeYaml()}</pre>
          </div>
        </div>

        {/* Visual stack nodes (Middle) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[300px]">
          <h4 className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest mb-4">
            Active Stack Services
          </h4>

          <div className="w-full max-w-xs flex flex-col gap-3">
            {activeServices.length > 0 ? (
              activeServices.map((id) => {
                const s = AVAILABLE_SERVICES[id];
                return (
                  <div key={id} className="animate-fadeIn font-sans">
                    <NodePrimitive
                      label={s.name}
                      status="idle"
                      icon={<Layers className="w-4 h-4 text-zinc-300" />}
                      subtitle={`Image: ${s.image}`}
                      className="py-2.5 px-3 rounded-[12px]"
                    />
                  </div>
                );
              })
            ) : (
              <div className="border border-dashed border-zinc-850 rounded-[12px] p-6 text-center text-[9px] text-zinc-650 italic bg-[#0d0d0e] font-sans">
                No services selected.
              </div>
            )}
          </div>
        </div>

        {/* Select service checkers (Right) */}
        <div className="w-full md:w-72 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Stack Selector
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">Enable Services</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Toggle nodes below to observe compose configuration compilations live.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 select-none font-sans">
            {Object.keys(AVAILABLE_SERVICES).map((key) => {
              const s = AVAILABLE_SERVICES[key];
              const isActive = activeServices.includes(s.id);

              return (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-[9px] text-left font-mono text-[9.5px] font-bold transition-all border border-zinc-850 flex items-center justify-between cursor-pointer",
                    isActive 
                      ? "bg-zinc-800 text-white border-zinc-700" 
                      : "bg-[#0d0d0e] text-zinc-450 hover:bg-zinc-855"
                  )}
                >
                  <div className="flex flex-col">
                    <span>{s.name}</span>
                    <span className="text-[7.5px] text-zinc-550 font-normal">Image: {s.image}</span>
                  </div>
                  {isActive ? (
                    <Minus className="w-4 h-4 text-zinc-300" />
                  ) : (
                    <Plus className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
