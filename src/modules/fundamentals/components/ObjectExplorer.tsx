"use client";

import React, { useState } from "react";
import { Layers, PlaySquare, HardDrive, Network, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import EdgePrimitive from "@/components/primitives/EdgePrimitive";

interface DockerObject {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
  description: string;
  relationshipDesc: string;
  attributes: Record<string, string>;
  commands: { cmd: string; desc: string }[];
}

const OBJECTS_DATA: Record<string, DockerObject> = {
  images: {
    id: "images",
    name: "Images",
    icon: Layers,
    subtitle: "Read-Only Blueprint",
    description: "Read-only template containing instructions to build a container. Formed by stacked, immutable filesystem layers.",
    relationshipDesc: "An Image acts as the template used to spawn Container instances. It cannot be altered once built.",
    attributes: {
      Format: "OCI Image / Docker v2",
      Mutability: "Immutable (Read-Only)",
      Layers: "Base OS + Dependencies + Code",
    },
    commands: [
      { cmd: "docker build -t app:1.0 .", desc: "Build an image from a Dockerfile" },
      { cmd: "docker images", desc: "List local cached images" },
    ],
  },
  containers: {
    id: "containers",
    name: "Containers",
    icon: PlaySquare,
    subtitle: "Running Isolated Process",
    description: "Running, isolated instance of an image. Allocates system processes, mounts namespace/cgroups boundaries, and appends a thin writeable layer.",
    relationshipDesc: "A Container is instantiated from an Image. It mounts Volumes for persistent storage and connects to Networks to talk to other containers.",
    attributes: {
      Process: "Isolated namespace process on host kernel",
      Mutability: "Writeable Layer (ephemeral)",
      Isolation: "Namespaces & Control Groups",
    },
    commands: [
      { cmd: "docker run -d nginx", desc: "Run an image in a detached container" },
      { cmd: "docker ps", desc: "List active running containers" },
    ],
  },
  volumes: {
    id: "volumes",
    name: "Volumes",
    icon: HardDrive,
    subtitle: "Persistent Data Storage",
    description: "Storage mechanism designed to persist container-generated data outside the container's ephemeral writeable layer.",
    relationshipDesc: "A Volume mounts onto a Container directory path, allowing files to persist even if the container is stopped or deleted.",
    attributes: {
      Location: "/var/lib/docker/volumes/",
      Lifespan: "Persistent (outlives container)",
      Performance: "Host native read/write speeds",
    },
    commands: [
      { cmd: "docker volume create data", desc: "Create a named storage volume" },
      { cmd: "docker volume ls", desc: "List active storage volumes" },
    ],
  },
  networks: {
    id: "networks",
    name: "Networks",
    icon: Network,
    subtitle: "Isolated Communication Bridge",
    description: "Communication channels that allow container processes to exchange data packets securely and resolve service names using internal DNS.",
    relationshipDesc: "A Network isolates container subnets. Containers connected to the same network can communicate using IP or service names.",
    attributes: {
      Driver: "Bridge (default) / Host / Overlay",
      DNS: "Internal DNS name resolution",
      Security: "Network namespace boundary",
    },
    commands: [
      { cmd: "docker network create my-net", desc: "Create a custom bridge network" },
      { cmd: "docker network ls", desc: "List active docker network bridges" },
    ],
  },
};

export default function ObjectExplorer() {
  const [selectedId, setSelectedId] = useState<string>("images");

  const activeObj = OBJECTS_DATA[selectedId];

  return (
    <VisualCanvas
      objective="Explore Docker Objects (Images, Containers, Volumes, Networks) and understand how they link together."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Object Relationships
          </div>
          <p>
            Docker coordinates several sub-systems: **Images** compile static code blueprints, which are run as isolated process sandboxes called **Containers**. These containers query virtual **Networks** to talk to other services and bind storage directories to **Volumes** to protect data from deletion.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none">
        {/* Interactive Relationship Graph Canvas (Left) */}
        <div className="flex-1 flex items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[300px]">
          
          {/* Centered relative container for SVG and Nodes to coordinate coordinates perfectly */}
          <div className="w-[420px] h-60 relative flex flex-col justify-between shrink-0">
            {/* SVG Connection Edges in background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Edge 1: Image creates Container (horizontal connection) */}
              <EdgePrimitive
                x1={176}
                y1={34}
                x2={244}
                y2={34}
                curveType="straight"
                label="creates"
                active={selectedId === "images" || selectedId === "containers"}
              />
              {/* Edge 2: Container mounts Volume (diagonal connection) */}
              <EdgePrimitive
                x1={244}
                y1={68}
                x2={176}
                y2={172}
                curveType="straight"
                label="mounts"
                active={selectedId === "containers" || selectedId === "volumes"}
              />
              {/* Edge 3: Container connects to Network (vertical connection) */}
              <EdgePrimitive
                x1={332}
                y1={68}
                x2={332}
                y2={172}
                curveType="straight"
                label="connects"
                active={selectedId === "containers" || selectedId === "networks"}
              />
            </svg>

            {/* Nodes Grid Wrapper */}
            <div className="absolute inset-0 z-10 flex flex-col justify-between w-full h-full pointer-events-none">
              {/* Top Row: Images & Containers */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div
                  onClick={() => setSelectedId("images")}
                  className="w-44 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <NodePrimitive
                    label="Image"
                    type="laptop"
                    status={selectedId === "images" ? "healthy" : "idle"}
                    icon={<Layers className="w-4 h-4" />}
                  />
                </div>

                <div
                  onClick={() => setSelectedId("containers")}
                  className="w-44 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <NodePrimitive
                    label="Container"
                    type="container"
                    status={selectedId === "containers" ? "healthy" : "idle"}
                    icon={<PlaySquare className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Bottom Row: Volumes & Networks */}
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div
                  onClick={() => setSelectedId("volumes")}
                  className="w-44 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <NodePrimitive
                    label="Volume"
                    type="database"
                    status={selectedId === "volumes" ? "healthy" : "idle"}
                    icon={<HardDrive className="w-4 h-4" />}
                  />
                </div>

                <div
                  onClick={() => setSelectedId("networks")}
                  className="w-44 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <NodePrimitive
                    label="Network"
                    type="network"
                    status={selectedId === "networks" ? "healthy" : "idle"}
                    icon={<Network className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Object Detail Inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#A1A1AA] font-bold block mb-1">
              {activeObj.subtitle}
            </span>
            <h4 className="text-base font-extrabold text-white font-sans">{activeObj.name}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              {activeObj.description}
            </p>
          </div>

          {/* Relationship Connection Note */}
          <div className="p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[10px] text-zinc-450 leading-relaxed select-text font-sans">
            <span className="font-bold block mb-0.5 text-zinc-200">Relationship:</span>
            {activeObj.relationshipDesc}
          </div>

          {/* Key attributes list */}
          <div className="space-y-2 select-text">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 block">
              Key Properties
            </span>
            <div className="flex flex-col gap-1.5 text-[10px] font-sans">
              {Object.entries(activeObj.attributes).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-zinc-800/20 pb-1">
                  <span className="text-zinc-500 font-medium">{key}:</span>
                  <span className="text-zinc-300 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common CLI Commands */}
          <div className="space-y-2 shrink-0 select-text font-sans">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 block">
              Common CLI Actions
            </span>
            <div className="flex flex-col gap-2">
              {activeObj.commands.map((c, i) => (
                <div key={i} className="p-2 bg-[#0d0d0e] rounded-[9px] border border-zinc-800/30 font-mono text-[9px] text-zinc-450">
                  <div className="text-zinc-300 font-semibold flex items-center gap-1">
                    <ArrowRight className="w-2.5 h-2.5 text-[#FAFAFA]" />
                    {c.cmd}
                  </div>
                  <span className="text-zinc-550 mt-0.5 block text-[8px]">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VisualCanvas>
  );
}
