"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Info, HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

export default function ComposeYaml() {
  const [orchestrated, setOrchestrated] = useState<boolean>(false);

  const getYamlCode = () => {
    if (orchestrated) {
      return `version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      api-service:
        condition: service_healthy

  api-service:
    image: node:18
    ports:
      - "3000:3000"
    depends_on:
      db-server:
        condition: service_healthy

  db-server:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5`;
    }

    return `version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"

  api-service:
    image: node:18
    ports:
      - "3000:3000"

  db-server:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb`;
  };

  const yamlString = getYamlCode();

  return (
    <VisualCanvas
      objective="Trace how Docker Compose handles dependency parameters and health check startup sequences."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is service health validation?
          </div>
          <p>
            By default, Compose boots all services concurrently. However, because databases (like PostgreSQL) compile configurations slowly, dependent APIs will crash if they query database ports before boot sequences complete.
          </p>
          <p>
            Adding `healthcheck` and `depends_on` forces the compose wrapper to await healthy statuses before booting downstream processes.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch gap-6 min-h-0 select-none font-sans">
        
        {/* Monospaced editor view (Left) */}
        <div className="flex-1 flex flex-col rounded-[18px] border border-zinc-800/40 bg-[#121214] overflow-hidden relative shadow-sm min-h-[300px]">
          <div className="bg-[#1a1a1e] px-4 py-2 border-b border-zinc-800/30 flex items-center shrink-0 justify-between">
            <span className="text-[8px] font-mono text-zinc-500 font-bold">docker-compose.yml</span>
          </div>

          <div className="flex-1 p-5 font-mono text-[9.5px] text-zinc-300 overflow-y-auto leading-relaxed bg-[#0d0d0e] custom-scrollbar select-text">
            <pre className="whitespace-pre">{yamlString}</pre>
          </div>
        </div>

        {/* Controller & Explanations sidebar (Right) */}
        <div className="w-full md:w-85 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Controller
            </span>
            <h4 className="text-sm font-extrabold text-white">Startup Dependency</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Toggle startup constraints to modify the configuration file live.
            </p>
          </div>

          {/* Startup dependencies switch */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex items-center justify-between select-none">
            <div className="flex flex-col pr-3">
              <span className="text-[11px] font-bold text-zinc-200">
                Orchestrate Boot Order
              </span>
              <span className="text-[8.5px] text-zinc-550 leading-normal mt-0.5 font-mono">
                depends_on + healthcheck
              </span>
            </div>
            
            <button
              onClick={() => setOrchestrated(!orchestrated)}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                orchestrated ? "bg-white" : "bg-zinc-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  orchestrated ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          {/* Detailed Explanation info box */}
          <div className="flex-1 flex flex-col justify-start select-text mt-2 font-sans">
            {orchestrated ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-white">
                  <Info className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">With Orchestration</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-normal">
                  By setting <code>depends_on</code> with <code>condition: service_healthy</code>, you ensure Compose waits for the database to complete internal post-startup checks before launching dependent services.
                  <br /><br />
                  This completely prevents API startup failures where Node attempt to query SQL tables before the database finishes loading.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">Without Orchestration</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-normal">
                  By default, Compose boots all services concurrently to speed up launch times.
                  <br /><br />
                  However, because complex database processes take several seconds to boot, the API service starts up and immediately queries database ports, causing connection failures.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
