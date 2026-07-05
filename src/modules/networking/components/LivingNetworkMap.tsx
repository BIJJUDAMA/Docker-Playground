"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Monitor, Server, Database, Globe, RefreshCw, Cpu, Power, Activity, Plus, Minus } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import gsap from "gsap";

// Traffic density types
type TrafficLevel = "low" | "medium" | "high" | "peak";

// Node health types
type HealthStatus = "healthy" | "offline";

interface NodeDetails {
  name: string;
  role: string;
  load: string;
  connections: string;
  trafficMix: string;
}

interface ActivePacket {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  type: "http" | "sql" | "redis";
  isError: boolean;
  step: number;
  meta?: string;
}

export default function LivingNetworkMap() {
  // Replicas counts
  const [frontendReplicas, setFrontendReplicas] = useState<string[]>(["frontA", "frontB"]);
  const [apiReplicas, setApiReplicas] = useState<string[]>(["api1"]);
  const [redisReplicas, setRedisReplicas] = useState<string[]>(["redis1"]);

  // Crashed node tracking list
  const [crashedNodes, setCrashedNodes] = useState<string[]>([]);

  // Simulation settings
  const [trafficLevel, setTrafficLevel] = useState<TrafficLevel>("medium");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [clickedNode, setClickedNode] = useState<string | null>(null);

  // Load balancing alternation index
  const [lbStep, setLbStep] = useState<number>(0);

  // GSAP Packets state pool
  const [activePackets, setActivePackets] = useState<ActivePacket[]>([]);
  const packetIdCounter = useRef<number>(0);
  const animatedPackets = useRef<Set<string>>(new Set());

  const [terminalLog, setTerminalLog] = useState("Configure cluster replicas on the cards directly to observe live distributed flows.");

  // Alternates LB destination highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setLbStep(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Pure mathematical coordinates evaluation for the 600x400 sandbox coordinate space (spacious layout)
  const getNodeCoords = useCallback((id: string): { x: number; y: number } => {
    if (id === "internet") return { x: 300, y: 25 };
    if (id === "browser") return { x: 300, y: 75 };
    if (id === "lb") return { x: 300, y: 130 };
    
    if (id === "frontA") {
      if (frontendReplicas.length === 1) return { x: 300, y: 195 };
      if (frontendReplicas.length === 2) return { x: 200, y: 195 };
      return { x: 120, y: 195 };
    }
    if (id === "frontB") {
      if (frontendReplicas.length === 2) return { x: 400, y: 195 };
      return { x: 300, y: 195 };
    }
    if (id === "frontC") {
      return { x: 480, y: 195 };
    }

    if (id === "api1") {
      if (apiReplicas.length === 1) return { x: 300, y: 265 };
      return { x: 200, y: 265 };
    }
    if (id === "api2") {
      return { x: 400, y: 265 };
    }

    if (id === "db") return { x: 130, y: 345 };

    if (id === "redis1") {
      if (redisReplicas.length === 1) return { x: 440, y: 345 };
      return { x: 350, y: 345 };
    }
    if (id === "redis2") {
      return { x: 480, y: 345 };
    }

    return { x: 300, y: 200 };
  }, [frontendReplicas, apiReplicas, redisReplicas]);

  const handleReset = () => {
    setFrontendReplicas(["frontA", "frontB"]);
    setApiReplicas(["api1"]);
    setRedisReplicas(["redis1"]);
    setTrafficLevel("medium");
    setHoveredNode(null);
    setClickedNode(null);
    setCrashedNodes([]);
    setActivePackets([]);
    animatedPackets.current.clear();
    setTerminalLog("Configure cluster replicas and sliders to observe live distributed flows.");
  };

  // Check node crash state
  const isNodeCrashed = (id: string) => crashedNodes.includes(id);

  // Toggle crash state for a container
  const toggleCrashNode = (id: string) => {
    setCrashedNodes(prev => {
      const isCrashed = prev.includes(id);
      if (isCrashed) {
        setTerminalLog(l => l + `\ndaemon$ [SUCCESS] restarted container **${id}**`);
        return prev.filter(x => x !== id);
      } else {
        setTerminalLog(l => l + `\ndaemon$ [FAILURE] container **${id}** crashed`);
        return [...prev, id];
      }
    });
  };

  // Peak traffic autoscaling trigger
  useEffect(() => {
    const isApi1Crashed = isNodeCrashed("api1");
    if (trafficLevel === "peak" && apiReplicas.length === 1 && !isApi1Crashed) {
      setTerminalLog(prev => prev + "\ndaemon$ [WARNING] api-service CPU load exceeded 85%. Triggering autoscaling task...");
      
      const timer = setTimeout(() => {
        setApiReplicas(["api1", "api2"]);
        setTerminalLog(prev => prev + "\ndaemon$ [SUCCESS] Autoscale complete. Spawned container **api-service-2** replica. Traffic successfully redistributed.");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [trafficLevel, apiReplicas, crashedNodes]);

  // Determine node health statuses
  const getNodeHealth = (id: string): HealthStatus => {
    return isNodeCrashed(id) ? "offline" : "healthy";
  };

  // Node static descriptions for HUD overlays
  const getNodeDetails = (id: string): NodeDetails => {
    const base = {
      internet: { name: "Internet Gateway", role: "Public Traffic Routing", load: "N/A", connections: "Active Web Clients", trafficMix: "External HTTP" },
      browser: { name: "Client Browser", role: "Local User Endpoint", load: "Low", connections: "Load Balancer", trafficMix: "User Clicks" },
      lb: { name: "Nginx Load Balancer", role: "Reverse Proxy", load: trafficLevel === "peak" ? "88%" : "34%", connections: "Frontend App Nodes", trafficMix: "Round Robin HTTP" },
      frontA: { name: "web-front-a", role: "Frontend UI Web App", load: isNodeCrashed("frontA") ? "0%" : (trafficLevel === "peak" ? "92%" : "40%"), connections: "LB, api-service", trafficMix: "HTTP/Assets" },
      frontB: { name: "web-front-b", role: "Frontend UI Web App", load: isNodeCrashed("frontB") ? "0%" : (trafficLevel === "peak" ? "85%" : "42%"), connections: "LB, api-service", trafficMix: "HTTP/Assets" },
      frontC: { name: "web-front-c", role: "Frontend UI Web App", load: isNodeCrashed("frontC") ? "0%" : (trafficLevel === "peak" ? "68%" : "30%"), connections: "LB, api-service", trafficMix: "HTTP/Assets" },
      api1: { name: "api-service-1", role: "Backend Node API Server", load: isNodeCrashed("api1") ? "0%" : (isNodeCrashed("redis1") && isNodeCrashed("redis2") ? "95% (High)" : (trafficLevel === "peak" ? "84%" : "32%")), connections: "DB, Redis, Frontends", trafficMix: "REST API JSON" },
      api2: { name: "api-service-2", role: "Backend Node API Server", load: isNodeCrashed("api2") ? "0%" : (isNodeCrashed("redis1") && isNodeCrashed("redis2") ? "90% (High)" : (trafficLevel === "peak" ? "52%" : "28%")), connections: "DB, Redis, Frontends", trafficMix: "REST API JSON" },
      db: { name: "db-postgres", role: "PostgreSQL Database", load: isNodeCrashed("db") ? "0%" : (isNodeCrashed("redis1") && isNodeCrashed("redis2") ? "92% (Heavy)" : (trafficLevel === "peak" ? "74%" : "18%")), connections: "api-service", trafficMix: "SQL Queries / Transactions" },
      redis1: { name: "cache-redis-1", role: "Redis In-Memory Store", load: isNodeCrashed("redis1") ? "0%" : "22%", connections: "api-service", trafficMix: "Key-Value Lookups" },
      redis2: { name: "cache-redis-2", role: "Redis In-Memory Store", load: isNodeCrashed("redis2") ? "0%" : "18%", connections: "api-service", trafficMix: "Key-Value Lookups" }
    };
    return base[id as keyof typeof base] || base.browser;
  };

  // Check if a path is hovered or dimmed
  const getPathOpacity = (source: string, target: string) => {
    if (!hoveredNode) return 1.0;
    const isConnected = hoveredNode === source || hoveredNode === target;
    return isConnected ? 1.0 : 0.12;
  };

  const removePacket = (id: string) => {
    setActivePackets(prev => prev.filter(p => p.id !== id));
  };

  // Triggers the next downstream hop in the microservice packet journey
  const triggerNextHop = (packetType: "http" | "sql" | "redis", currentStep: number, sourceNode: string, targetNode: string) => {
    const nextId = `req-${packetIdCounter.current++}`;

    const cBrowser = getNodeCoords("browser");
    const cLb = getNodeCoords("lb");
    const cDb = getNodeCoords("db");

    const healthyFrontends = frontendReplicas.filter(f => !isNodeCrashed(f));
    const healthyApis = apiReplicas.filter(a => !isNodeCrashed(a));
    const allRedisCrashed = redisReplicas.every(r => isNodeCrashed(r));

    if (packetType === "http") {
      if (currentStep === 0) {
        // Step 0 complete (Internet -> Browser). Now trigger Browser -> LB
        setActivePackets(prev => [...prev, {
          id: nextId,
          startX: cBrowser.x,
          startY: cBrowser.y,
          endX: cLb.x,
          endY: cLb.y,
          color: "#3b82f6",
          type: "http",
          isError: false,
          step: 1
        }]);
      } 
      else if (currentStep === 1) {
        // Step 1 complete (Browser -> LB). Now trigger LB -> Frontend
        if (healthyFrontends.length === 0) {
          // All frontends crashed!
          setActivePackets(prev => [...prev, {
            id: nextId,
            startX: cLb.x,
            startY: cLb.y,
            endX: cLb.x,
            endY: cLb.y + 20, 
            color: "#3b82f6",
            type: "http",
            isError: true,
            step: 2
          }]);
          return;
        }

        // Round robin selection to healthy frontends
        const targetFront = healthyFrontends[lbStep % healthyFrontends.length];
        const cTarget = getNodeCoords(targetFront);

        setActivePackets(prev => [...prev, {
          id: nextId,
          startX: cLb.x,
          startY: cLb.y,
          endX: cTarget.x,
          endY: cTarget.y,
          color: "#3b82f6",
          type: "http",
          isError: false,
          step: 2,
          meta: targetFront
        }]);
      } 
      else if (currentStep === 2) {
        // Step 2 complete (LB -> Frontend). Now trigger Frontend -> API
        const currentFront = targetNode;
        const cFront = getNodeCoords(currentFront);
        
        if (healthyApis.length === 0) {
          // All APIs down! Packet crashes at frontend
          setActivePackets(prev => [...prev, {
            id: nextId,
            startX: cFront.x,
            startY: cFront.y,
            endX: cFront.x,
            endY: cFront.y + 15,
            color: "#3b82f6",
            type: "http",
            isError: true,
            step: 3
          }]);
          return;
        }

        // Select healthy API replica
        const apiTarget = healthyApis[Math.floor(Math.random() * healthyApis.length)];
        const cApi = getNodeCoords(apiTarget);

        setActivePackets(prev => [...prev, {
          id: nextId,
          startX: cFront.x,
          startY: cFront.y,
          endX: cApi.x,
          endY: cApi.y,
          color: "#3b82f6",
          type: "http",
          isError: false,
          step: 3,
          meta: apiTarget
        }]);
      } 
      else if (currentStep === 3) {
        // Step 3 complete (Frontend -> API).
        const currentApi = targetNode;
        const cApi = getNodeCoords(currentApi);

        // API queries Redis cache AND PostgreSQL Database
        // 1. Query Redis replicas
        redisReplicas.forEach(redisId => {
          const cRedis = getNodeCoords(redisId);
          setActivePackets(prev => [...prev, {
            id: `redis-${packetIdCounter.current++}`,
            startX: cApi.x,
            startY: cApi.y,
            endX: cRedis.x,
            endY: cRedis.y,
            color: "#f97316", // Orange
            type: "redis",
            isError: isNodeCrashed(redisId),
            step: 4
          }]);
        });

        // 2. Query PostgreSQL Database
        // If Redis is fully offline/crashed, database queries double (cache miss overload)
        const dbQueriesCount = allRedisCrashed ? 2 : 1;
        for (let q = 0; q < dbQueriesCount; q++) {
          setActivePackets(prev => [...prev, {
            id: `sql-${packetIdCounter.current++}`,
            startX: cApi.x,
            startY: cApi.y,
            endX: cDb.x,
            endY: cDb.y,
            color: "#a855f7", // Purple
            type: "sql",
            isError: isNodeCrashed("db"),
            step: 4
          }]);
        }
      }
    }
  };

  const spawnRequest = useCallback(() => {
    const cInternet = getNodeCoords("internet");
    const cBrowser = getNodeCoords("browser");
    if (!cInternet || !cBrowser) return;

    const id = `req-${packetIdCounter.current++}`;
    
    // Spawn Internet -> Browser packet
    setActivePackets(prev => [...prev, {
      id,
      startX: cInternet.x,
      startY: cInternet.y,
      endX: cBrowser.x,
      endY: cBrowser.y,
      color: "#3b82f6",
      type: "http",
      isError: false,
      step: 0
    }]);
  }, [getNodeCoords]);

  // Traffic density spawner loop
  useEffect(() => {
    const intervalVal = trafficLevel === "low" ? 1400 : (trafficLevel === "medium" ? 800 : (trafficLevel === "high" ? 450 : 220));
    
    const interval = setInterval(() => {
      spawnRequest();
    }, intervalVal);

    return () => clearInterval(interval);
  }, [trafficLevel, spawnRequest]);

  // Packet animation loop (GSAP attribute modifier on SVG `<circle>` nodes) - SLOWED DOWN
  useEffect(() => {
    activePackets.forEach(p => {
      if (animatedPackets.current.has(p.id)) return;
      animatedPackets.current.add(p.id);

      const el = document.getElementById(`packet-orb-${p.id}`);
      if (!el) return;

      // Slower packet flow durations
      let duration = 1.4; // HTTP
      if (p.type === "sql") duration = 2.0; // SQL
      if (p.type === "redis") duration = 0.9; // Redis

      // If isError is true, travel halfway, turn red and drop/spark
      const targetX = p.isError ? (p.startX + (p.endX - p.startX) / 2) : p.endX;
      const targetY = p.isError ? (p.startY + (p.endY - p.startY) / 2) : p.endY;

      gsap.to(el, {
        attr: { cx: targetX, cy: targetY },
        duration: duration,
        ease: "power1.inOut",
        onComplete: () => {
          if (p.isError) {
            // Spark / Flash Red
            gsap.timeline()
              .to(el, { attr: { r: 5 }, fill: "#ef4444", duration: 0.15 })
              .to(el, { opacity: 0, attr: { r: 0 }, duration: 0.2, onComplete: () => {
                removePacket(p.id);
                animatedPackets.current.delete(p.id);
              }});
          } else {
            // Success
            gsap.to(el, {
              opacity: 0,
              attr: { r: 0 },
              duration: 0.15,
              onComplete: () => {
                removePacket(p.id);
                animatedPackets.current.delete(p.id);
                triggerNextHop(p.type, p.step, "current", p.meta || "");
              }
            });
          }
        }
      });
    });
  }, [activePackets]);

  // Parser helper to bold markdown sections
  const renderBoldText = (text: string, colorClass: string) => {
    const parts = text.split("**");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className={cn("font-extrabold", colorClass)}>
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <VisualCanvas
      objective="Observe a live-traffic distributed Docker system: monitor real-time message brokers, cut databases, and view network failure cascades."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <Activity className="w-4 h-4 text-zinc-400" />
            Network Operations Center (NOC)
          </div>
          <p>
            Distributed containerized microservices constantly exchange internal network traffic. **HTTP calls** (blue) enter the system, get distributed, trigger **SQL transactions** (purple), or hit **Redis caches** (orange).
          </p>
          <p>
            Use container cards controls (`+`, `-`, power button) directly to scale nodes or crash target instances and watch the downstream cascading failures.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans overflow-y-auto max-h-[85vh]">
        
        {/* NOC Interactive Sandbox Canvas (Left) */}
        <div 
          onClick={() => setClickedNode(null)}
          className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#0d0d0e] rounded-[18px] relative shadow-inner min-h-[440px] overflow-hidden"
        >
          {/* NOC grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
          
          <div className="w-full max-w-[600px] aspect-[3/2] relative z-10">
            
            {/* SVG Cable Lines & Packet Orbs Overlay */}
            <svg viewBox="0 0 600 400" className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Internet -> Browser */}
              <line x1={300} y1={25} x2={300} y2={75} stroke="#1f1f23" strokeWidth="1.5" opacity={getPathOpacity("internet", "browser")} />
              {/* Browser -> LB */}
              <line x1={300} y1={75} x2={300} y2={130} stroke="#1f1f23" strokeWidth="1.5" opacity={getPathOpacity("browser", "lb")} />
              
              {/* LB -> Frontend paths */}
              {frontendReplicas.map(fId => (
                <line 
                  key={`line-lb-${fId}`}
                  x1={300} 
                  y1={130} 
                  x2={getNodeCoords(fId).x} 
                  y2={getNodeCoords(fId).y} 
                  stroke={getNodeHealth(fId) === "offline" ? "rgba(239, 68, 68, 0.15)" : "#1f1f23"} 
                  strokeWidth="1.5" 
                  opacity={getPathOpacity("lb", fId)}
                />
              ))}

              {/* Frontend -> API paths */}
              {frontendReplicas.map(fId => 
                apiReplicas.map(apiId => (
                  <line 
                    key={`line-${fId}-${apiId}`}
                    x1={getNodeCoords(fId).x} 
                    y1={getNodeCoords(fId).y} 
                    x2={getNodeCoords(apiId).x} 
                    y2={getNodeCoords(apiId).y} 
                    stroke={isNodeCrashed(apiId) ? "rgba(239, 68, 68, 0.15)" : "#1f1f23"} 
                    strokeWidth="1.5" 
                    opacity={getPathOpacity(fId, apiId)}
                  />
                ))
              )}

              {/* API -> DB paths */}
              {apiReplicas.map(apiId => (
                <line 
                  key={`line-${apiId}-db`}
                  x1={getNodeCoords(apiId).x} 
                  y1={getNodeCoords(apiId).y} 
                  x2={getNodeCoords("db").x} 
                  y2={getNodeCoords("db").y} 
                  stroke={isNodeCrashed("db") ? "rgba(239, 68, 68, 0.15)" : "#1f1f23"} 
                  strokeWidth="1.5" 
                  opacity={getPathOpacity(apiId, "db")}
                />
              ))}

              {/* API -> Redis paths */}
              {apiReplicas.map(apiId => 
                redisReplicas.map(redisId => (
                  <line 
                    key={`line-${apiId}-${redisId}`}
                    x1={getNodeCoords(apiId).x} 
                    y1={getNodeCoords(apiId).y} 
                    x2={getNodeCoords(redisId).x} 
                    y2={getNodeCoords(redisId).y} 
                    stroke={isNodeCrashed(redisId) ? "rgba(239, 68, 68, 0.15)" : "#1f1f23"} 
                    strokeWidth="1.5" 
                    opacity={getPathOpacity(apiId, redisId)}
                  />
                ))
              )}

              {/* GSAP Packet Orbs Layer inside SVG viewBox */}
              {activePackets.map(p => (
                <circle 
                  key={p.id}
                  id={`packet-orb-${p.id}`}
                  cx={p.startX}
                  cy={p.startY}
                  r={p.type === "sql" ? 3.5 : (p.type === "redis" ? 2.2 : 2.8)}
                  fill={p.color}
                  filter="url(#glow)"
                />
              ))}
            </svg>

            {/* Nodes Elements Layer (Positioned proportionally with math coordinates relative to 600x400 grid) */}

            {/* Stage 1: Internet Gateway */}
            <div 
              onMouseEnter={() => setHoveredNode("internet")}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={(e) => { e.stopPropagation(); setClickedNode("internet"); }}
              className="absolute transition-all cursor-pointer"
              style={{ left: `${(getNodeCoords("internet").x / 600) * 100}%`, top: `${(getNodeCoords("internet").y / 400) * 100}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 rounded-full border border-zinc-800 bg-[#0d0d0e] flex items-center justify-center text-zinc-450 hover:text-white hover:border-white transition-all shadow-md">
                  <Globe className="w-3 h-3" />
                </div>
                <span className="text-[5.5px] font-mono text-zinc-555">internet</span>
              </div>
            </div>

            {/* Stage 2: Client Browser */}
            <div 
              onMouseEnter={() => setHoveredNode("browser")}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={(e) => { e.stopPropagation(); setClickedNode("browser"); }}
              className="absolute transition-all cursor-pointer"
              style={{ left: `${(getNodeCoords("browser").x / 600) * 100}%`, top: `${(getNodeCoords("browser").y / 400) * 100}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="py-1 px-2 rounded-[6px] border border-zinc-850 bg-[#0d0d0e] text-zinc-350 hover:text-white hover:border-white transition-all shadow-md flex items-center gap-1">
                  <Monitor className="w-2.5 h-2.5 text-zinc-500" />
                  <span className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Browser</span>
                </div>
              </div>
            </div>

            {/* Stage 3: Load Balancer */}
            <div 
              onMouseEnter={() => setHoveredNode("lb")}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={(e) => { e.stopPropagation(); setClickedNode("lb"); }}
              className="absolute transition-all cursor-pointer"
              style={{ left: `${(getNodeCoords("lb").x / 600) * 100}%`, top: `${(getNodeCoords("lb").y / 400) * 100}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "py-1 px-2 rounded-[7px] border bg-[#0d0d0e] transition-all shadow-md flex items-center gap-1.5 relative whitespace-nowrap",
                  (healthyFrontends => healthyFrontends.length === 0)(frontendReplicas.filter(f => !isNodeCrashed(f))) ? "border-red-500/40 text-red-500" : "border-zinc-850 text-zinc-300 hover:border-white hover:text-white"
                )}>
                  <div className={cn(
                    "absolute -inset-0.5 rounded-[8px] border pointer-events-none transition-all duration-300",
                    (healthyFrontends => healthyFrontends.length === 0)(frontendReplicas.filter(f => !isNodeCrashed(f))) ? "border-red-500/20 shadow-[0_0_4px_rgba(239,68,68,0.1)]" : "border-green-500/10 shadow-[0_0_4px_rgba(34,197,94,0.1)]"
                  )} />
                  <Server className="w-2.5 h-2.5 text-zinc-555" />
                  <span className="text-[6.5px] font-mono font-bold uppercase tracking-wider">Load Balancer</span>
                </div>
              </div>
            </div>

            {/* Stage 4: Frontend Replicas */}
            {frontendReplicas.map((fId, idx) => {
              const isCrashed = isNodeCrashed(fId);
              const c = getNodeCoords(fId);
              return (
                <div 
                  key={fId}
                  onMouseEnter={() => setHoveredNode(fId)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); setClickedNode(fId); }}
                  className={cn(
                    "absolute transition-all duration-350 cursor-pointer",
                    isCrashed && "opacity-50"
                  )}
                  style={{ left: `${(c.x / 600) * 100}%`, top: `${(c.y / 400) * 100}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className={cn(
                    "py-1 px-2 rounded-[7px] border bg-[#0d0d0e] flex items-center gap-1.5 transition-all shadow-md relative whitespace-nowrap",
                    isCrashed ? "border-red-500/30 text-red-500" : "border-zinc-850 text-zinc-400 hover:border-white hover:text-white"
                  )}>
                    <div className={cn(
                      "absolute -inset-0.5 rounded-[8px] border pointer-events-none transition-all duration-300",
                      isCrashed ? "border-red-500/20 shadow-[0_0_4px_rgba(239,68,68,0.1)]" : "border-green-500/10 shadow-[0_0_4px_rgba(34,197,94,0.1)]"
                    )} />
                    <Server className="w-2.5 h-2.5 text-zinc-555" />
                    <span className="text-[6.5px] font-mono font-bold">{fId}</span>

                    {/* Direct Card Action Buttons */}
                    <div className="flex gap-1 items-center ml-2 border-l border-zinc-800 pl-1.5">
                      {/* Scale - */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (frontendReplicas.length > 1) {
                            setFrontendReplicas(prev => prev.slice(0, -1));
                            setTerminalLog(prev => prev + `\ndaemon$ Scaled down frontend replicas to **${frontendReplicas.length - 1}**`);
                          }
                        }}
                        disabled={frontendReplicas.length === 1}
                        className={cn(
                          "w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] text-[8px] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500",
                          frontendReplicas.length === 1 && "opacity-30 cursor-not-allowed hover:border-zinc-800"
                        )}
                      >
                        <Minus className="w-2 h-2" />
                      </button>

                      {/* Scale + */}
                      {idx === frontendReplicas.length - 1 && frontendReplicas.length < 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (frontendReplicas.length < 3) {
                              const nextId = frontendReplicas.length === 1 ? "frontB" : "frontC";
                              setFrontendReplicas(prev => [...prev, nextId]);
                              setTerminalLog(prev => prev + `\ndaemon$ Scaled up frontend replicas to **${frontendReplicas.length + 1}**`);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] text-[8px] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500"
                        >
                          <Plus className="w-2 h-2" />
                        </button>
                      )}

                      {/* Power / Crash */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCrashNode(fId);
                        }}
                        className={cn(
                          "w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500",
                          isCrashed ? "text-red-500 border-red-950/40" : "text-zinc-550"
                        )}
                      >
                        <Power className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Stage 5: Backend API Replicas */}
            {apiReplicas.map((apiId, idx) => {
              const isCrashed = isNodeCrashed(apiId);
              const health = getNodeHealth(apiId);
              const c = getNodeCoords(apiId);
              return (
                <div 
                  key={apiId}
                  onMouseEnter={() => setHoveredNode(apiId)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); setClickedNode(apiId); }}
                  className={cn(
                    "absolute cursor-pointer",
                    isCrashed && "opacity-50"
                  )}
                  style={{ left: `${(c.x / 600) * 100}%`, top: `${(c.y / 400) * 100}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className={cn(
                    "py-1 px-2 rounded-[8px] border bg-[#0d0d0e] transition-all shadow-md flex items-center gap-1.5 relative whitespace-nowrap",
                    health === "offline" 
                      ? "border-red-500/30 text-red-500" 
                      : "border-zinc-850 text-zinc-350 hover:border-white hover:text-white"
                  )}>
                    <div className={cn(
                      "absolute -inset-0.5 rounded-[9px] border pointer-events-none transition-all duration-300",
                      health === "offline" ? "border-red-500/20 shadow-[0_0_4px_rgba(239,68,68,0.1)]" : "border-green-500/10 shadow-[0_0_4px_rgba(34,197,94,0.1)]"
                    )} />
                    <Cpu className="w-2.5 h-2.5 text-zinc-555" />
                    <span className="text-[6.5px] font-mono font-bold uppercase tracking-wider">{apiId}</span>

                    {/* Direct Card Action Buttons */}
                    <div className="flex gap-1 items-center ml-2 border-l border-zinc-800 pl-1.5">
                      {/* Scale - */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (apiReplicas.length > 1) {
                            setApiReplicas(prev => prev.slice(0, -1));
                            setTerminalLog(prev => prev + `\ndaemon$ Scaled down backend API replicas to **${apiReplicas.length - 1}**`);
                          }
                        }}
                        disabled={apiReplicas.length === 1}
                        className={cn(
                          "w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] text-[8px] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500",
                          apiReplicas.length === 1 && "opacity-30 cursor-not-allowed hover:border-zinc-800"
                        )}
                      >
                        <Minus className="w-2 h-2" />
                      </button>

                      {/* Scale + */}
                      {idx === apiReplicas.length - 1 && apiReplicas.length < 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (apiReplicas.length < 2) {
                              setApiReplicas(prev => [...prev, "api2"]);
                              setTerminalLog(prev => prev + `\ndaemon$ Scaled up backend API replicas to **${apiReplicas.length + 1}**`);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] text-[8px] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500"
                        >
                          <Plus className="w-2 h-2" />
                        </button>
                      )}

                      {/* Power / Crash */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCrashNode(apiId);
                        }}
                        className={cn(
                          "w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500",
                          isCrashed ? "text-red-500 border-red-950/40" : "text-zinc-550"
                        )}
                      >
                        <Power className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Stage 6: Persistent Storage (PostgreSQL) */}
            {(() => {
              const isCrashed = isNodeCrashed("db");
              const c = getNodeCoords("db");
              return (
                <div 
                  onMouseEnter={() => setHoveredNode("db")}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); setClickedNode("db"); }}
                  className={cn(
                    "absolute transition-all duration-350 cursor-pointer",
                    isCrashed && "opacity-50"
                  )}
                  style={{ left: `${(c.x / 600) * 100}%`, top: `${(c.y / 400) * 100}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className={cn(
                    "py-1 px-2 rounded-[7px] border bg-[#0d0d0e] flex items-center gap-1.5 transition-all shadow-md relative whitespace-nowrap",
                    isCrashed ? "border-red-500/30 text-red-500" : "border-zinc-850 text-zinc-400 hover:border-white hover:text-white"
                  )}>
                    <div className={cn(
                      "absolute -inset-0.5 rounded-[8px] border pointer-events-none transition-all duration-300",
                      isCrashed ? "border-red-500/20 shadow-[0_0_4px_rgba(239,68,68,0.1)]" : "border-green-500/10 shadow-[0_0_4px_rgba(34,197,94,0.1)]"
                    )} />
                    <Database className="w-2.5 h-2.5 text-zinc-555" />
                    <span className="text-[6.5px] font-mono font-bold">db-postgres</span>

                    {/* Direct Card Power Crash Button */}
                    <div className="flex gap-1 items-center ml-2 border-l border-zinc-800 pl-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCrashNode("db");
                        }}
                        className={cn(
                          "w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500",
                          isCrashed ? "text-red-500 border-red-950/40" : "text-zinc-550"
                        )}
                      >
                        <Power className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Stage 6: Cache (Redis Replicas) */}
            {redisReplicas.map((redisId, idx) => {
              const isCrashed = isNodeCrashed(redisId);
              const c = getNodeCoords(redisId);
              return (
                <div 
                  key={redisId}
                  onMouseEnter={() => setHoveredNode(redisId)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); setClickedNode(redisId); }}
                  className={cn(
                    "absolute transition-all duration-355 cursor-pointer",
                    isCrashed && "opacity-50"
                  )}
                  style={{ left: `${(c.x / 600) * 100}%`, top: `${(c.y / 400) * 100}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className={cn(
                    "py-1 px-2 rounded-[7px] border bg-[#0d0d0e] flex items-center gap-1.5 transition-all shadow-md relative whitespace-nowrap",
                    isCrashed ? "border-red-500/30 text-red-500" : "border-zinc-850 text-zinc-450 hover:border-white hover:text-white"
                  )}>
                    <div className={cn(
                      "absolute -inset-0.5 rounded-[8px] border pointer-events-none transition-all duration-300",
                      isCrashed ? "border-red-500/20 shadow-[0_0_4px_rgba(239,68,68,0.1)]" : "border-green-500/10 shadow-[0_0_4px_rgba(34,197,94,0.1)]"
                    )} />
                    <Database className="w-2.5 h-2.5 text-zinc-555" />
                    <span className="text-[6.5px] font-mono font-bold">{redisId}</span>

                    {/* Direct Card Action Buttons */}
                    <div className="flex gap-1 items-center ml-2 border-l border-zinc-800 pl-1.5">
                      {/* Scale - */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (redisReplicas.length > 1) {
                            setRedisReplicas(prev => prev.slice(0, -1));
                            setTerminalLog(prev => prev + `\ndaemon$ Scaled down Redis cache replicas to **${redisReplicas.length - 1}**`);
                          }
                        }}
                        disabled={redisReplicas.length === 1}
                        className={cn(
                          "w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] text-[8px] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500",
                          redisReplicas.length === 1 && "opacity-30 cursor-not-allowed hover:border-zinc-800"
                        )}
                      >
                        <Minus className="w-2 h-2" />
                      </button>

                      {/* Scale + */}
                      {idx === redisReplicas.length - 1 && redisReplicas.length < 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (redisReplicas.length < 2) {
                              setRedisReplicas(prev => [...prev, "redis2"]);
                              setTerminalLog(prev => prev + `\ndaemon$ Scaled up Redis cache replicas to **${redisReplicas.length + 1}**`);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] text-[8px] flex items-center justify-center cursor-pointer text-zinc-400 hover:border-zinc-500"
                        >
                          <Plus className="w-2 h-2" />
                        </button>
                      )}

                      {/* Power / Crash */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCrashNode(redisId);
                        }}
                        className={cn(
                          "w-3.5 h-3.5 rounded border border-zinc-800 bg-[#121214] flex items-center justify-center cursor-pointer text-zinc-450 hover:border-zinc-500",
                          isCrashed ? "text-red-500 border-red-950/40" : "text-zinc-550"
                        )}
                      >
                        <Power className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clickable Floating HUD Details Overlay */}
            {clickedNode && (
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  left: `${(getNodeCoords(clickedNode).x / 600) * 100}%`, 
                  top: `${(getNodeCoords(clickedNode).y / 400) * 100 - 15}%`,
                  transform: "translate(-50%, -100%)"
                }}
                className="absolute w-32 p-2.5 rounded-[12px] border border-zinc-800/80 bg-[#161618]/95 backdrop-blur-md shadow-2xl z-30 flex flex-col gap-1 font-sans animate-fadeIn text-[7.5px]"
              >
                <div className="flex justify-between items-center border-b border-zinc-800 pb-1 mb-1.5 select-none">
                  <span className="font-bold text-white uppercase text-[8px]">
                    {getNodeDetails(clickedNode).name}
                  </span>
                  <button 
                    onClick={() => setClickedNode(null)}
                    className="border-0 bg-transparent text-zinc-550 hover:text-white cursor-pointer font-bold text-[8px]"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-0.5 select-text leading-normal">
                  <div><span className="text-zinc-500">Role:</span> <span className="text-zinc-300 font-semibold">{getNodeDetails(clickedNode).role}</span></div>
                  <div><span className="text-zinc-500">Load:</span> <span className="text-zinc-300 font-semibold">{getNodeDetails(clickedNode).load}</span></div>
                  <div><span className="text-zinc-500">Peers:</span> <span className="text-zinc-300 font-semibold">{getNodeDetails(clickedNode).connections}</span></div>
                  <div><span className="text-zinc-500">Traffic:</span> <span className="text-zinc-300 font-semibold">{getNodeDetails(clickedNode).trafficMix}</span></div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn max-h-[85vh] overflow-y-auto">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Traffic Console
            </span>
            <h4 className="text-sm font-extrabold text-white">NOC Controls</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Alter replica scale bounds and sever database/caching endpoints directly on the container cards to watch failure propagation loops.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 flex-1 justify-center select-none font-sans">
            
            {/* Speed density selector */}
            <div className="flex flex-col gap-1.5 font-sans">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>Network Traffic Density:</span>
                <span className="text-zinc-450 uppercase text-[9px] font-mono">{trafficLevel}</span>
              </div>
              <div className="flex rounded-[6px] border border-zinc-800 bg-[#0d0d0e] p-0.5 overflow-hidden">
                {(["low", "medium", "high", "peak"] as TrafficLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setTrafficLevel(level);
                      setTerminalLog(prev => prev + `\nproxy$ Configured traffic level index to: **${level}**`);
                    }}
                    className={cn(
                      "flex-1 py-1 rounded-[4px] border-0 text-[8.5px] font-bold transition-all cursor-pointer",
                      trafficLevel === level ? "bg-white text-black" : "bg-transparent text-zinc-550 hover:text-zinc-300"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Diagnostic output - Fixed Scrollability */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col max-h-[160px] overflow-hidden select-text font-sans shrink-0">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-555 font-bold">Trace output logs:</span>
            </div>
            <div className="p-3 font-mono text-[9px] leading-relaxed overflow-y-auto flex-1 flex flex-col gap-0.5 max-h-[130px] scrollbar-thin">
              {terminalLog.split("\n").map((line, i) => {
                let colorClass = "text-zinc-400";
                if (line.includes("[SUCCESS]") || line.toLowerCase().includes("success") || line.toLowerCase().includes("healthy") || line.toLowerCase().includes("online")) {
                  colorClass = "text-green-400 font-semibold";
                } else if (line.includes("[FAILURE]") || line.includes("[WARNING]") || line.toLowerCase().includes("error") || line.toLowerCase().includes("failed") || line.toLowerCase().includes("crashed")) {
                  colorClass = "text-red-405 font-semibold";
                } else if (line.includes("$")) {
                  colorClass = "text-zinc-500 font-mono";
                }
                return (
                  <div key={i} className={colorClass}>
                    {renderBoldText(line, colorClass)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outage cascades info overlay */}
          <div className="flex flex-col justify-end font-sans shrink-0">
            {redisReplicas.every(r => isNodeCrashed(r)) && (
              <div className="p-3 rounded-[12px] bg-yellow-950/5 border border-yellow-500/15 text-[8.5px] text-yellow-505 leading-normal flex items-start gap-1.5 animate-fadeIn mb-2 select-text font-sans">
                <span>
                  [WARNING] REDIS OUTAGE: All cache instances offline. Cache misses are forcing API requests to query primary PostgreSQL nodes directly. CPU usage spiking!
                </span>
              </div>
            )}

            {isNodeCrashed("db") && (
              <div className="p-3 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-1.5 animate-fadeIn mb-2 select-text font-sans">
                <span>
                  [FAILURE] DATABASE OFFLINE: Postgres DB node offline. API calls fail to compile data models, returning 500 Internal Errors!
                </span>
              </div>
            )}

            {frontendReplicas.every(f => isNodeCrashed(f)) && (
              <div className="p-3 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-1.5 animate-fadeIn mb-2 select-text font-sans">
                <span>
                  [FAILURE] OUTAGE: All frontend replicas crashed. Load Balancer cannot proxy incoming requests!
                </span>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset NOC Map
            </button>
          </div>

        </div>

      </div>
    </VisualCanvas>
  );
}
