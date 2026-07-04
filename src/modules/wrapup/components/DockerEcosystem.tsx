"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Network, Shield, HelpCircle, Activity, Globe } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface EcosystemCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  summary: string;
  desc: string;
}

const ECOSYSTEM_CARDS: EcosystemCard[] = [
  {
    id: "orchestration",
    name: "Container Orchestration",
    icon: <Network className="w-5 h-5 text-zinc-300" />,
    summary: "Manage containers at scale.",
    desc: "Move from single instances to massive cloud deployments. Kubernetes (K8s) and Docker Swarm automate container scheduling, auto-scaling, self-healing pod restarts, and load balancing across server clusters."
  },
  {
    id: "security",
    name: "Security & Hardening",
    icon: <Shield className="w-5 h-5 text-zinc-350" />,
    summary: "Lock down container runtimes.",
    desc: "Containers share the host kernel. Hardening involves running rootless Docker, dropping unused kernel privileges, sandboxing runs (using gVisor or kata containers), and scanning image layers for CVE vulnerabilities."
  },
  {
    id: "monitoring",
    name: "Observability & Metrics",
    icon: <Activity className="w-5 h-5 text-zinc-400" />,
    summary: "Monitor cluster performance.",
    desc: "Track resources across production bounds. Tools like Prometheus, Grafana, and cAdvisor collect CPU, Memory, disk IO, and network traffic metrics directly from container cgroups systems."
  },
  {
    id: "registries",
    name: "Enterprise Registries",
    icon: <Globe className="w-5 h-5 text-zinc-500" />,
    summary: "Vulnerability layer scanning.",
    desc: "Establish private registries (Google Artifact Registry, AWS ECR, Harbor). Configure automatic vulnerability alerts, policy enforcement gates, and registry replication loops for geographic redundancy."
  }
];

export default function DockerEcosystem() {
  const [activeId, setActiveId] = useState<string>("orchestration");

  const activeCard = ECOSYSTEM_CARDS.find((c) => c.id === activeId) || ECOSYSTEM_CARDS[0];

  return (
    <VisualCanvas
      objective="Explore advanced topics in the container ecosystem to continue your cloud engineering career path."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is the container ecosystem?
          </div>
          <p>
            Docker is the entry point. A production architecture includes orchestration clusters, security boundaries, observability metrics collectors, and artifact repositories.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Ecosystem Grid (Left) */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[300px]">
          {ECOSYSTEM_CARDS.map((card) => {
            const isActive = activeId === card.id;

            return (
              <div
                key={card.id}
                onClick={() => setActiveId(card.id)}
                className={cn(
                  "p-4 rounded-[12px] border cursor-pointer transition-all duration-300 flex flex-col justify-between hover:scale-[1.01] hover:bg-zinc-850/10 font-sans",
                  isActive 
                    ? "border-zinc-700 bg-zinc-800/25 shadow-sm" 
                    : "border-zinc-850 bg-[#0d0d0e]"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {card.icon}
                  <span className="text-[11px] font-bold text-zinc-200">{card.name}</span>
                </div>
                <p className="text-[10px] text-zinc-450 leading-relaxed font-normal font-sans">
                  {card.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Card Inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Ecosystem Inspector
            </span>
            <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 font-sans">
              {activeCard.name}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {activeCard.desc}
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 text-[10px] text-zinc-450 leading-relaxed mt-auto select-text font-sans">
            <span className="font-bold block mb-0.5 text-zinc-200">Starting Tips:</span>
            {activeId === "orchestration" && "Start by deploying simple Kubernetes clusters locally using tools like minikube, Kind, or Docker Desktop's built-in Kubernetes support."}
            {activeId === "security" && "Practice vulnerability scanning on images using 'docker scout' or open-source scanner tools like Trivy inside your builds."}
            {activeId === "monitoring" && "Learn how container statistics are mapped inside /sys/fs/cgroup/ host folder paths to read hardware statistics."}
            {activeId === "registries" && "Create a free Docker Hub account to practice tags organization, builds automation, and webhook triggers."}
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
