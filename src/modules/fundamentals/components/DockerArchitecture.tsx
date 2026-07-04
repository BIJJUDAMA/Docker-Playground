"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Laptop, Cpu, Layers, RefreshCw, CloudLightning } from "lucide-react";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import gsap from "gsap";
import VisualCanvas from "@/components/layout/VisualCanvas";

// --- CUSTOM NODES DATA TYPES ---

interface ClientNodeData {
  triggerCommand: (command: string) => void;
  activeCommand: string | null;
}

interface DaemonNodeData {
  status: string;
  isProcessing: boolean;
}

interface ImagesNodeData {
  images: string[];
}

interface ContainersNodeData {
  containers: string[];
}

// --- CUSTOM NODES STYLING ---

// 1. Client Node Component
function ClientNode({ data }: { data: ClientNodeData }) {
  return (
    <div className="px-4 py-3 rounded-[12px] border border-zinc-800/40 bg-[#121214] shadow-sm min-w-[170px] font-sans">
      <div className="flex items-center gap-2 mb-2 text-[#FAFAFA]">
        <Laptop className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider font-mono">Docker Client</span>
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        <button
          onClick={() => data.triggerCommand("docker build")}
          disabled={data.activeCommand !== null}
          className="px-3 py-1.5 text-[9px] font-bold text-left rounded-full bg-[#1a1a1e] text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
        >
          docker build
        </button>
        <button
          onClick={() => data.triggerCommand("docker pull")}
          disabled={data.activeCommand !== null}
          className="px-3 py-1.5 text-[9px] font-bold text-left rounded-full bg-[#1a1a1e] text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
        >
          docker pull
        </button>
        <button
          onClick={() => data.triggerCommand("docker run")}
          disabled={data.activeCommand !== null}
          className="px-3 py-1.5 text-[9px] font-bold text-left rounded-full bg-[#1a1a1e] text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
        >
          docker run
        </button>
      </div>
      <Handle type="source" position={Position.Right} id="client-out" className="!w-2 !h-2 !bg-[#FAFAFA]" />
    </div>
  );
}

// 2. Daemon Node Component
function DaemonNode({ data }: { data: DaemonNodeData }) {
  return (
    <div className="px-4 py-3 rounded-[12px] border border-zinc-800/40 bg-[#121214] shadow-sm min-w-[170px] relative overflow-hidden font-sans">
      {data.isProcessing && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FAFAFA] animate-pulse" />
      )}
      <div className="flex items-center gap-2 mb-1.5 text-[#FAFAFA]">
        <Cpu className="w-4 h-4 animate-spin-slow" />
        <span className="text-xs font-bold uppercase tracking-wider font-mono">Docker Daemon</span>
      </div>
      <p className="text-[10px] text-zinc-400 font-mono mt-1">
        {data.status || "listening for API requests..."}
      </p>
      <Handle type="target" position={Position.Left} id="daemon-in" className="!w-2 !h-2 !bg-zinc-700" />
      <Handle type="source" position={Position.Top} id="daemon-to-images" className="!w-2 !h-2 !bg-zinc-700" />
      <Handle type="source" position={Position.Bottom} id="daemon-to-containers" className="!w-2 !h-2 !bg-zinc-700" />
      <Handle type="source" position={Position.Right} id="daemon-to-registry" className="!w-2 !h-2 !bg-zinc-700" />
      <Handle type="target" position={Position.Right} id="registry-to-daemon" className="!w-2 !h-2 !bg-zinc-700" />
    </div>
  );
}

// 3. Images Node Component
function ImagesNode({ data }: { data: ImagesNodeData }) {
  return (
    <div className="px-4 py-3 rounded-[12px] border border-zinc-800/40 bg-[#121214] shadow-sm min-w-[160px] font-sans">
      <div className="flex items-center gap-2 mb-1.5 text-zinc-300">
        <Layers className="w-4 h-4 text-zinc-350" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-350">Local Images</span>
      </div>
      <div className="flex flex-col gap-1 mt-2 min-h-[44px]">
        {data.images.length > 0 ? (
          data.images.map((img: string, i: number) => (
            <div key={i} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#1a1a1e] text-zinc-300 animate-fadeIn">
              {img}
            </div>
          ))
        ) : (
          <span className="text-[9px] text-zinc-650 font-mono italic">No images cached...</span>
        )}
      </div>
      <Handle type="target" position={Position.Bottom} id="images-in" className="!w-2 !h-2 !bg-zinc-700" />
    </div>
  );
}

// 4. Containers Node Component
function ContainersNode({ data }: { data: ContainersNodeData }) {
  return (
    <div className="px-4 py-3 rounded-[12px] border border-zinc-800/40 bg-[#121214] shadow-sm min-w-[160px] font-sans">
      <div className="flex items-center gap-2 mb-1.5 text-zinc-350">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-white">Containers</span>
      </div>
      <div className="flex flex-col gap-1 mt-2 min-h-[44px]">
        {data.containers.length > 0 ? (
          data.containers.map((c: string, i: number) => (
            <div key={i} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-150 font-bold animate-fadeIn">
              {c}
            </div>
          ))
        ) : (
          <span className="text-[9px] text-zinc-650 font-mono italic">No containers running...</span>
        )}
      </div>
      <Handle type="target" position={Position.Top} id="containers-in" className="!w-2 !h-2 !bg-zinc-700" />
    </div>
  );
}

// 5. Registry Node Component
function RegistryNode() {
  return (
    <div className="px-4 py-3 rounded-[12px] border border-zinc-800/40 bg-[#121214] shadow-sm min-w-[160px] font-sans">
      <div className="flex items-center gap-2 mb-1.5 text-zinc-300">
        <CloudLightning className="w-4 h-4 text-zinc-350" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-350">Docker Hub</span>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <div className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#1a1a1e] text-zinc-400">
          registry/webapp:latest
        </div>
      </div>
      <Handle type="target" position={Position.Left} id="registry-in" className="!w-2 !h-2 !bg-zinc-700" />
      <Handle type="source" position={Position.Left} id="registry-out" className="!w-2 !h-2 !bg-zinc-700" />
    </div>
  );
}

const nodeTypes = {
  clientNode: ClientNode,
  daemonNode: DaemonNode,
  imagesNode: ImagesNode,
  containersNode: ContainersNode,
  registryNode: RegistryNode,
};

export default function DockerArchitecture() {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [daemonStatus, setDaemonStatus] = useState("listening for API requests...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [localContainers, setLocalContainers] = useState<string[]>([]);
  const [terminalLog, setTerminalLog] = useState<string>("Click a command on the Docker Client to simulate execution...");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const animateEdge = useCallback((edgeIdPrefix: string, active: boolean, color = "#FAFAFA") => {
    setEdges((prev) =>
      prev.map((edge) => {
        if (
          edge.sourceHandle === edgeIdPrefix ||
          edge.id.startsWith(edgeIdPrefix)
        ) {
          return {
            ...edge,
            animated: active,
            style: {
              stroke: active ? color : "#27272a",
              strokeWidth: active ? 3 : 2,
              transition: "stroke 0.3s, stroke-width 0.3s",
            },
          };
        }
        return edge;
      })
    );
  }, [setEdges]);

  const triggerCommand = useCallback((command: string) => {
    setActiveCommand(command);
    setIsProcessing(true);
    
    if (timeline) {
      timeline.kill();
    }

    const bootTimeline = gsap.timeline();
    setTimeline(bootTimeline);

    if (command === "docker pull") {
      setTerminalLog("docker pull webapp:latest\nConnecting to API daemon...");
      setDaemonStatus("PULL request received...");

      bootTimeline.to({}, {
        duration: 0.1,
        onStart: () => animateEdge("client-out", true, "#FAFAFA"),
      })
      .to({}, { duration: 0.8 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("client-out", false);
          setTerminalLog("docker pull webapp:latest\nDaemon contacting Docker Hub...");
          setDaemonStatus("Requesting image from Hub...");
          animateEdge("daemon-to-registry", true, "#FAFAFA");
        }
      })
      .to({}, { duration: 1.0 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("daemon-to-registry", false);
          setTerminalLog("docker pull webapp:latest\nDownloading image layers...");
          setDaemonStatus("Downloading layers...");
          animateEdge("registry-to-daemon", true, "#FAFAFA");
        }
      })
      .to({}, { duration: 1.2 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("registry-to-daemon", false);
          setTerminalLog("docker pull webapp:latest\nStoring layers locally...");
          setDaemonStatus("Caching image in local cache...");
          animateEdge("daemon-to-images", true, "#FAFAFA");
        }
      })
      .to({}, { duration: 0.8 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("daemon-to-images", false);
          setLocalImages(["webapp:latest"]);
          setDaemonStatus("completed pull.");
          setTerminalLog("docker pull webapp:latest\n\nStatus: Downloaded newer image for webapp:latest\n[SUCCESS] Image pulled successfully");
        }
      })
      .to({}, {
        duration: 0.05,
        onStart: () => {
          setIsProcessing(false);
          setActiveCommand(null);
          setEdges((prev) =>
            prev.map((edge) => ({
              ...edge,
              animated: false,
              style: { stroke: "#27272a", strokeWidth: 2 },
            }))
          );
        }
      });
    }

    if (command === "docker build") {
      setTerminalLog("docker build -t customapp:1.0 .\nSending build context to Docker Daemon...");
      setDaemonStatus("Building customapp:1.0...");

      bootTimeline.to({}, {
        duration: 0.1,
        onStart: () => animateEdge("client-out", true, "#FAFAFA"),
      })
      .to({}, { duration: 1.0 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("client-out", false);
          setTerminalLog("docker build -t customapp:1.0 .\nStep 1/3: FROM python:3.10-alpine\nStep 2/3: COPY . /app\nStep 3/3: RUN pip install -r requirements.txt");
          setDaemonStatus("Executing instruction layers...");
        }
      })
      .to({}, { duration: 1.8 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          setDaemonStatus("Saving cached image...");
          setTerminalLog("docker build -t customapp:1.0 .\nSuccessfully built image customapp:1.0");
          animateEdge("daemon-to-images", true, "#FAFAFA");
        }
      })
      .to({}, { duration: 0.8 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("daemon-to-images", false);
          setLocalImages((prev) => [...prev.filter((i) => i !== "customapp:1.0"), "customapp:1.0"]);
          setDaemonStatus("listening for API requests...");
        }
      })
      .to({}, {
        duration: 0.05,
        onStart: () => {
          setIsProcessing(false);
          setActiveCommand(null);
          setEdges((prev) =>
            prev.map((edge) => ({
              ...edge,
              animated: false,
              style: { stroke: "#27272a", strokeWidth: 2 },
            }))
          );
        }
      });
    }

    if (command === "docker run") {
      setTerminalLog("docker run -d -p 80:80 webapp:latest\nConnecting to daemon...");
      setDaemonStatus("Run container request...");

      bootTimeline.to({}, {
        duration: 0.1,
        onStart: () => animateEdge("client-out", true, "#FAFAFA"),
      })
      .to({}, { duration: 0.8 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("client-out", false);
          setTerminalLog("docker run -d -p 80:80 webapp:latest\nChecking local images cache...");
          setDaemonStatus("Checking image catalog...");
          animateEdge("daemon-to-images", true, "#FAFAFA");
        }
      })
      .to({}, { duration: 0.6 })
      .to({}, {
        duration: 0.1,
        onStart: () => {
          animateEdge("daemon-to-images", false);
          
          const hasImage = localImages.includes("webapp:latest");
          if (!hasImage) {
            setTerminalLog("docker run -d -p 80:80 webapp:latest\nImage not found locally. Initiating automated pull...");
            setDaemonStatus("Pulling webapp:latest...");
            animateEdge("daemon-to-registry", true, "#FAFAFA");
            
            bootTimeline.to({}, { duration: 1.0 })
              .to({}, {
                duration: 0.1,
                onStart: () => {
                  animateEdge("daemon-to-registry", false);
                  animateEdge("registry-to-daemon", true, "#FAFAFA");
                }
              })
              .to({}, { duration: 1.2 })
              .to({}, {
                duration: 0.1,
                onStart: () => {
                  animateEdge("registry-to-daemon", false);
                  setLocalImages((prev) => [...prev, "webapp:latest"]);
                  setTerminalLog("docker run -d -p 80:80 webapp:latest\nImage pulled. Instantiating container...");
                  setDaemonStatus("Creating container container_1...");
                  animateEdge("daemon-to-containers", true, "#FAFAFA");
                }
              })
              .to({}, { duration: 1.0 })
              .to({}, {
                duration: 0.1,
                onStart: () => {
                  animateEdge("daemon-to-containers", false);
                  setLocalContainers(["container_1 (running)"]);
                  setDaemonStatus("listening for API requests...");
                  setTerminalLog("docker run -d -p 80:80 webapp:latest\n[SUCCESS] Container container_1 started.\nID: d75522b1...\nListening on port 80");
                }
              })
              .to({}, {
                duration: 0.05,
                onStart: () => {
                  setIsProcessing(false);
                  setActiveCommand(null);
                  setEdges((prev) =>
                    prev.map((edge) => ({
                      ...edge,
                      animated: false,
                      style: { stroke: "#27272a", strokeWidth: 2 },
                    }))
                  );
                }
              });
          } else {
            setTerminalLog("docker run -d -p 80:80 webapp:latest\nImage found locally. Launching container process...");
            setDaemonStatus("Creating container container_1...");
            animateEdge("daemon-to-containers", true, "#FAFAFA");
            
            bootTimeline.to({}, { duration: 0.8 })
              .to({}, {
                duration: 0.1,
                onStart: () => {
                  animateEdge("daemon-to-containers", false);
                  setLocalContainers(["container_1 (running)"]);
                  setDaemonStatus("listening for API requests...");
                  setTerminalLog("docker run -d -p 80:80 webapp:latest\n[SUCCESS] Container container_1 started.\nID: d75522b1...\nListening on port 80");
                }
              })
              .to({}, {
                duration: 0.05,
                onStart: () => {
                  setIsProcessing(false);
                  setActiveCommand(null);
                  setEdges((prev) =>
                    prev.map((edge) => ({
                      ...edge,
                      animated: false,
                      style: { stroke: "#27272a", strokeWidth: 2 },
                    }))
                  );
                }
              });
          }
        }
      });
    }
  }, [localImages, timeline, animateEdge, setEdges]);

  // Update nodes dynamic properties when values change
  useEffect(() => {
    const initialNodes = [
      {
        id: "client",
        type: "clientNode",
        position: { x: 40, y: 140 },
        data: { triggerCommand, activeCommand },
      },
      {
        id: "daemon",
        type: "daemonNode",
        position: { x: 300, y: 140 },
        data: { status: daemonStatus, isProcessing },
      },
      {
        id: "images",
        type: "imagesNode",
        position: { x: 305, y: 10 },
        data: { images: localImages },
      },
      {
        id: "containers",
        type: "containersNode",
        position: { x: 305, y: 280 },
        data: { containers: localContainers },
      },
      {
        id: "registry",
        type: "registryNode",
        position: { x: 570, y: 140 },
        data: {},
      },
    ];

    setNodes(initialNodes);
  }, [daemonStatus, isProcessing, localImages, localContainers, activeCommand, triggerCommand, setNodes]);

  // Establish initial edges layout
  useEffect(() => {
    const initialEdges = [
      {
        id: "client-daemon",
        source: "client",
        sourceHandle: "client-out",
        target: "daemon",
        targetHandle: "daemon-in",
        animated: false,
        style: { stroke: "#27272a", strokeWidth: 2 },
      },
      {
        id: "daemon-images",
        source: "daemon",
        sourceHandle: "daemon-to-images",
        target: "images",
        targetHandle: "images-in",
        animated: false,
        style: { stroke: "#27272a", strokeWidth: 2 },
      },
      {
        id: "daemon-containers",
        source: "daemon",
        sourceHandle: "daemon-to-containers",
        target: "containers",
        targetHandle: "containers-in",
        animated: false,
        style: { stroke: "#27272a", strokeWidth: 2 },
      },
      {
        id: "daemon-registry",
        source: "daemon",
        sourceHandle: "daemon-to-registry",
        target: "registry",
        targetHandle: "registry-in",
        animated: false,
        style: { stroke: "#27272a", strokeWidth: 2 },
      },
      {
        id: "registry-daemon",
        source: "registry",
        sourceHandle: "registry-out",
        target: "daemon",
        targetHandle: "registry-to-daemon",
        animated: false,
        style: { stroke: "#27272a", strokeWidth: 2 },
      },
    ];

    setEdges(initialEdges);
  }, [setEdges]);

  const handleReset = useCallback(() => {
    setLocalImages([]);
    setLocalContainers([]);
    setDaemonStatus("listening for API requests...");
    setIsProcessing(false);
    setActiveCommand(null);
    setTerminalLog("Click a command on the Docker Client to simulate execution...");
    
    if (timeline) {
      timeline.kill();
    }

    setEdges((prev) =>
      prev.map((edge) => ({
        ...edge,
        animated: false,
        style: { stroke: "#27272a", strokeWidth: 2 },
      }))
    );
  }, [timeline, setEdges]);

  // Handle timeline unmount cleanups
  useEffect(() => {
    return () => {
      if (timeline) timeline.kill();
    };
  }, [timeline]);

  return (
    <VisualCanvas
      objective="Understand the client-server architecture of Docker, tracing how commands interact with the Daemon and registry."
      timeline={timeline}
      explanation={
        <div className="flex flex-col gap-2">
          <span className="font-bold text-zinc-200">Docker Architecture Layers:</span>
          <p>
            The **Docker Client** sends REST API instructions to the background **Docker Daemon (dockerd)**. The Daemon downloads images from the remote **Docker Registry**, compiles them locally, and runs container process environments.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col gap-4 min-h-[350px] relative">
        {/* Custom inline keyframes style block to handle CSS animations in sandboxed layout */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />

        {/* Node Graph Sandbox Container */}
        <div className="flex-1 rounded-[18px] border border-zinc-800/40 bg-[#0d0d0e] relative overflow-hidden min-h-[260px] shadow-sm">
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            className="bg-transparent"
          >
            <Controls showInteractive={false} className="!border-zinc-800/40 !bg-[#121214] !text-zinc-500" />
          </ReactFlow>
        </div>

        {/* macOS Window Terminal frame */}
        <div className="rounded-[12px] border border-zinc-800/40 bg-[#121214] overflow-hidden flex flex-col shrink-0 h-[88px] shadow-sm relative">
          <div className="bg-[#1a1a1e] px-4 py-1.5 border-b border-zinc-800/30 flex items-center shrink-0">
            <span className="text-[9px] font-mono text-zinc-500">console output</span>
          </div>
          
          <div className="p-3 font-mono text-[9px] leading-relaxed overflow-y-auto flex-1 bg-[#0d0d0e] flex flex-col gap-0.5 select-text">
            {terminalLog.split("\n").map((line, i) => {
              let className = "text-zinc-400";
              if (line.includes("[SUCCESS]") || line.toLowerCase().includes("success") || line.includes("✓") || line.toLowerCase().includes("pulled") || line.toLowerCase().includes("running")) {
                className = "text-green-400 font-semibold";
              } else if (line.includes("[FAILURE]") || line.includes("[WARNING]") || line.toLowerCase().includes("error") || line.toLowerCase().includes("failed") || line.includes("⚠")) {
                className = "text-red-400 font-semibold";
              } else if (line.includes("$") || line.includes("docker")) {
                className = "text-zinc-550 font-mono";
              }
              return (
                <div key={i} className={className}>
                  {line}
                </div>
              );
            })}
          </div>
          
          {/* Action reset controls overlay */}
          {(localImages.length > 0 || localContainers.length > 0 || isProcessing) && (
            <button
              onClick={handleReset}
              className="absolute bottom-2.5 right-2.5 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors border border-zinc-800/40 bg-[#121214] shadow-sm cursor-pointer select-none"
            >
              <RefreshCw className="w-3 h-3 inline mr-1 animate-spin-slow" />
              Reset Graph
            </button>
          )}
        </div>
      </div>
    </VisualCanvas>
  );
}
