"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";

interface PipelineStage {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "commit", name: "Commit", subtitle: "Version Control", desc: "Developer writes feature changes and commits source changes down to local git repository configurations." },
  { id: "push", name: "Push", subtitle: "Trigger Pipeline", desc: "Developer pushes commit branches to shared remote repos (GitHub), firing off webhook events." },
  { id: "ci", name: "Test (CI)", subtitle: "Continuous Integration", desc: "Automated webhook pipeline spawns test runner containers, verifying test assertions and syntax linters." },
  { id: "build", name: "Build", subtitle: "Image compilation", desc: "Build agent processes the active branch Dockerfile instructions, compiling the final immutable container image." },
  { id: "registry", name: "Push Hub", subtitle: "Publish Artifact", desc: "Agent pushes the compiled container image stack up to central Docker Hub registries, verifying layer digests." },
  { id: "deploy", name: "Deploy", subtitle: "Continuous Delivery", desc: "Staging/Production orchestration server pulls the new image hash digest, booting containers cleanly." }
];

export default function CicdPipeline() {
  const [activeStageId, setActiveStageId] = useState<string>("commit");
  const [animationState, setAnimationState] = useState<"idle" | "running" | "complete">("idle");
  const [terminalLog, setTerminalLog] = useState("Click play to trigger the CI/CD pipeline webhook.");

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setAnimationState("idle");
    setActiveStageId("commit");
    setTerminalLog("Click play to trigger the CI/CD pipeline webhook.");
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { x: 0, opacity: 0, scale: 0 });
  }, [timeline]);

  useEffect(() => {
    handleReset();

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setAnimationState("running"),
      onComplete: () => {
        setAnimationState("complete");
        setTerminalLog("Deployment completed successfully: cluster running image version tag digest.");
      }
    });

    setTimeline(tl);

    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.1 })
      // Commit -> Push
      .to(packetRef.current, {
        x: 100,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStageId("push");
          setTerminalLog("git commit -am 'feat: add database configs'\ngit push origin main\nTriggering webhook...");
        }
      })
      // Push -> CI
      .to(packetRef.current, {
        x: 200,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStageId("ci");
          setTerminalLog("Webhook parsed. Launching GitHub runner...\nRunning npm run lint...\nRunning npm run test...\n[SUCCESS] Tests passed.");
        }
      })
      // CI -> Build
      .to(packetRef.current, {
        x: 300,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStageId("build");
          setTerminalLog("docker build -t app:v1.2.0 .\nStep 1: FROM node:18-alpine (Cache hit)\nStep 2: COPY . .\nStep 3: RUN npm run build\n[SUCCESS] Image app:v1.2.0 generated.");
        }
      })
      // Build -> Registry
      .to(packetRef.current, {
        x: 400,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStageId("registry");
          setTerminalLog("docker push myorg/app:v1.2.0\nPreparing layers digest metadata...\nPushing layer 1...\n[SUCCESS] Image pushed to Docker Hub.");
        }
      })
      // Registry -> Deploy
      .to(packetRef.current, {
        x: 500,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStageId("deploy");
          setTerminalLog("cd-agent: detected new registry digest tag version.\nkubectl set image deployment/app app=myorg/app:v1.2.0\nPulling image layers...\nRestarting pods...");
        }
      })
      // Commit complete
      .to(packetRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.3
      });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <VisualCanvas
      objective="Understand how container images act as standardized build artifacts across automated webhook pipelines."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is a containerized CI/CD pipeline?
          </div>
          <p>
            Containers serve as clean execution hosts for tests, and standard compile targets. Testing runs inside test runner containers, builds push to Hub registries, and servers pull identical layer packs instantly.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Pipeline Track Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-x-auto custom-scrollbar">
          
          <div className="w-[600px] h-32 relative flex items-center justify-between py-2 px-6">
            {/* Pathway wire */}
            <div className="absolute top-[41px] left-[50px] right-[50px] h-0.5 border-t border-dashed border-zinc-850 pointer-events-none z-0" />

            {/* Glowing packet */}
            <PacketPrimitive
              ref={packetRef}
              color="#FAFAFA"
              size={11}
              className="top-[36px] left-[45px]"
            />

            {PIPELINE_STAGES.map((stage, idx) => {
              const isActive = activeStageId === stage.id;
              
              return (
                <div key={stage.id} className="w-20 relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center font-bold text-[10px] font-mono transition-all duration-300",
                    isActive 
                      ? "bg-zinc-800 border-zinc-700 text-white scale-105" 
                      : "bg-[#0d0d0e] border-zinc-855 text-zinc-550"
                  )}>
                    {idx + 1}
                  </div>
                  
                  <span className={cn(
                    "text-[8px] font-mono font-bold uppercase tracking-wider mt-2.5 text-center",
                    isActive ? "text-zinc-300" : "text-zinc-550"
                  )}>
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn font-sans">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              {PIPELINE_STAGES.find((s) => s.id === activeStageId)?.subtitle}
            </span>
            <h4 className="text-base font-extrabold text-white">
              {PIPELINE_STAGES.find((s) => s.id === activeStageId)?.name} Stage
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {PIPELINE_STAGES.find((s) => s.id === activeStageId)?.desc}
            </p>
          </div>

          {/* Terminal log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text mt-auto font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">runner console stdout</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 select-text">
              {terminalLog}
            </div>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
