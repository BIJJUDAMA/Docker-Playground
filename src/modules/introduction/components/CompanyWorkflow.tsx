"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";

export default function CompanyWorkflow() {
  const [pipelineState, setPipelineState] = useState<"idle" | "building" | "pushed" | "deployed">("idle");
  const [devConsole, setDevConsole] = useState("Ready to build...");
  const [registryConsole, setRegistryConsole] = useState("Empty registry...");
  const [stagingConsole, setStagingConsole] = useState("Offline...");
  const [productionConsole, setProductionConsole] = useState("Offline...");

  const containerRef = useRef<HTMLDivElement>(null);
  const devImageRef = useRef<HTMLDivElement>(null);
  const registryImageRef = useRef<HTMLDivElement>(null);
  const stagingImageRef = useRef<HTMLDivElement>(null);
  const productionImageRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  // Initialize playback control registrations
  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setPipelineState("idle");
    setDevConsole("Ready to build...");
    setRegistryConsole("Empty registry...");
    setStagingConsole("Offline...");
    setProductionConsole("Offline...");
    
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set([devImageRef.current, registryImageRef.current, stagingImageRef.current, productionImageRef.current], {
      scale: 0,
      opacity: 0,
    });
    gsap.set(packetRef.current, { x: 0, y: 0, opacity: 0, scale: 0 });
  }, [timeline]);

  useEffect(() => {
    let tl: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      tl = gsap.timeline({
        paused: true,
        onStart: () => {
          setPipelineState("building");
          setDevConsole("docker build -t app:1.0 .\n[BUILD] packaging files...");
        },
        onComplete: () => {
          setPipelineState("deployed");
          setStagingConsole("[RUNNING] Listening on port 80\nParity match: 100%");
          setProductionConsole("[RUNNING] Listening on port 80\nParity match: 100%");
        }
      });

      setTimeline(tl);

      // Initial positions for pack/image and packets
      gsap.set([devImageRef.current, registryImageRef.current, stagingImageRef.current, productionImageRef.current], {
        scale: 0,
        opacity: 0,
      });
      gsap.set(packetRef.current, { x: 0, y: 0, opacity: 0, scale: 0 });

      // 1. Build image on Dev Laptop
      tl.to(devImageRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.5)",
        onComplete: () => setDevConsole("[SUCCESS] Image built:\napp:1.0 (15.4MB)")
      })
      // 2. Push Image packet Dev -> Registry
      .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      .to(packetRef.current, {
        x: 230, // Dev to Registry
        duration: 1.0,
        ease: "power2.inOut",
        onStart: () => setDevConsole("docker push registry.hub/app:1.0")
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.2 })
      .to(registryImageRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.5)",
        onStart: () => {
          setPipelineState("pushed");
          setRegistryConsole("app:1.0 received.\nSHA256: 9e32a10b...\nLayers: 4/4 cached");
        }
      })
      // 3. Deploy parallel pulls to Staging & Production
      .add("deploy")
      .to(packetRef.current, { x: 230, y: 0, opacity: 1, scale: 1, duration: 0.1 })
      .to(packetRef.current, {
        x: 460,
        y: -50,
        duration: 1.0,
        ease: "power2.out",
        onStart: () => setStagingConsole("docker pull app:1.0\n[PULL] downloading layers...")
      }, "deploy")
      .to(stagingImageRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.5)"
      }, "deploy+=0.8")
      
      // Pull to production
      .to(packetRef.current, { x: 230, y: 0, opacity: 1, scale: 1, duration: 0.1 }, "deploy")
      .to(packetRef.current, {
        x: 460,
        y: 50,
        duration: 1.0,
        ease: "power2.out",
        onStart: () => setProductionConsole("docker pull app:1.0\n[PULL] downloading layers...")
      }, "deploy")
      .to(productionImageRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.5)"
      }, "deploy+=0.8");
    });

    return () => {
      ctx.revert();
      if (tl) tl.kill();
    };
  }, []);

  return (
    <VisualCanvas
      objective="Trace how Docker images unify software deployment packaging, eliminating build parity issues across testing and live hosts."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Unifying Dev to Prod Workflows
          </div>
          <p>
            In a traditional deployment model, code has to be configured and installed on every host environment manually, inviting parity errors. 
          </p>
          <p>
            With Docker, the code is packaged into an <strong>Image</strong> once on the developer's laptop, published to a central <strong>Registry</strong>, and then downloaded as the exact same image on Staging and Production servers, guaranteeing 100% environment parity.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[300px] bg-[#121214] border border-zinc-800/40 rounded-[18px] p-6 font-sans">
        {/* Visual Pipeline Grid */}
        <div className="w-full max-w-3xl relative flex flex-col md:flex-row items-center justify-between gap-6 py-6 min-h-0 select-none">
          {/* Animated data packet */}
          <PacketPrimitive
            ref={packetRef}
            color="#FAFAFA"
            size={10}
            className="top-[37px] left-[110px]"
          />

          {/* Background connection wire paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
            {/* Dev to Registry */}
            <line x1="120" y1="41" x2="350" y2="41" stroke="#232323" strokeWidth="1.5" strokeDasharray="5 5" />
            {/* Registry to Staging */}
            <path d="M 370 41 C 410 41, 460 -10, 610 -10" fill="none" stroke="#232323" strokeWidth="1.5" strokeDasharray="5 5" />
            {/* Registry to Production */}
            <path d="M 370 41 C 410 41, 460 90, 610 90" fill="none" stroke="#232323" strokeWidth="1.5" strokeDasharray="5 5" />
          </svg>

          {/* 1. Developer Laptop Node */}
          <NodePrimitive
            label="Dev Laptop"
            type="laptop"
            status={pipelineState === "idle" ? "idle" : pipelineState === "building" ? "booting" : "healthy"}
            className="flex-1 w-full relative z-15"
          >
            <div className="h-10 border border-[#232323] bg-[#090909] rounded-[6px] flex items-center justify-center relative overflow-hidden select-none">
              <div 
                ref={devImageRef}
                className="w-7 h-7 rounded-[6px] bg-white text-black font-bold text-[9px] shadow-sm flex items-center justify-center select-none"
              >
                v1.0
              </div>
              {pipelineState === "idle" && (
                <span className="text-[9px] uppercase tracking-wider text-[#71717A] font-bold animate-pulse font-mono">Awaiting build</span>
              )}
            </div>

            <div className="rounded-[6px] bg-[#090909] border border-[#232323] overflow-hidden flex flex-col w-full shadow-inner select-text">
              <div className="p-2.5 font-mono text-[8px] text-[#A1A1AA] min-h-[44px] leading-relaxed">
                {devConsole}
              </div>
            </div>
          </NodePrimitive>

          {/* 2. Central Registry Node */}
          <NodePrimitive
            label="Registry (Hub)"
            type="database"
            status={pipelineState === "idle" || pipelineState === "building" ? "idle" : "healthy"}
            className="flex-1 w-full relative z-15"
          >
            <div className="h-10 border border-[#232323] bg-[#090909] rounded-[6px] flex items-center justify-center relative overflow-hidden select-none">
              <div 
                ref={registryImageRef}
                className="w-7 h-7 rounded-[6px] bg-white text-black font-bold text-[9px] shadow-sm flex items-center justify-center select-none"
              >
                v1.0
              </div>
              {(pipelineState === "idle" || pipelineState === "building") && (
                <span className="text-[9px] uppercase tracking-wider text-[#71717A] font-bold font-mono">No Image</span>
              )}
            </div>

            <div className="rounded-[6px] bg-[#090909] border border-[#232323] overflow-hidden flex flex-col w-full shadow-inner select-text">
              <div className="p-2.5 font-mono text-[8px] text-[#A1A1AA] min-h-[44px] leading-relaxed">
                {registryConsole}
              </div>
            </div>
          </NodePrimitive>

          {/* Right Area Staging/Prod Host stack */}
          <div className="flex-1 w-full flex flex-col gap-4 relative z-15">
            {/* 3. Staging Server Node */}
            <NodePrimitive
              label="Staging Host"
              type="server"
              status={pipelineState === "deployed" ? "healthy" : pipelineState === "pushed" ? "booting" : "idle"}
              className="w-full"
            >
              <div className="h-10 border border-[#232323] bg-[#090909] rounded-[6px] flex items-center justify-center relative overflow-hidden select-none">
                <div 
                  ref={stagingImageRef}
                  className="w-7 h-7 rounded-[6px] bg-white text-black font-bold text-[9px] shadow-sm flex items-center justify-center select-none"
                >
                  v1.0
                </div>
                {pipelineState !== "deployed" && pipelineState !== "pushed" && (
                  <span className="text-[9px] uppercase tracking-wider text-[#71717A] font-bold font-mono">Offline</span>
                )}
              </div>

              <div className="rounded-[6px] bg-[#090909] border border-[#232323] overflow-hidden flex flex-col w-full shadow-inner select-text">
                <div className="p-2.5 font-mono text-[8px] text-[#A1A1AA] min-h-[44px] leading-relaxed">
                  {stagingConsole}
                </div>
              </div>
            </NodePrimitive>

            {/* 4. Production Server Node */}
            <NodePrimitive
              label="Production Host"
              type="server"
              status={pipelineState === "deployed" ? "healthy" : pipelineState === "pushed" ? "booting" : "idle"}
              className="w-full"
            >
              <div className="h-10 border border-[#232323] bg-[#090909] rounded-[6px] flex items-center justify-center relative overflow-hidden select-none">
                <div 
                  ref={productionImageRef}
                  className="w-7 h-7 rounded-[6px] bg-white text-black font-bold text-[9px] shadow-sm flex items-center justify-center select-none"
                >
                  v1.0
                </div>
                {pipelineState !== "deployed" && pipelineState !== "pushed" && (
                  <span className="text-[9px] uppercase tracking-wider text-[#71717A] font-bold font-mono">Offline</span>
                )}
              </div>

              <div className="rounded-[6px] bg-[#090909] border border-[#232323] overflow-hidden flex flex-col w-full shadow-inner select-text">
                <div className="p-2.5 font-mono text-[8px] text-[#A1A1AA] min-h-[44px] leading-relaxed">
                  {productionConsole}
                </div>
              </div>
            </NodePrimitive>
          </div>
        </div>
      </div>
    </VisualCanvas>
  );
}
