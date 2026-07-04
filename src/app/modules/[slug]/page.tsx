import { getModuleBySlug, modules } from "@/data/modules";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { notFound } from "next/navigation";
import { Terminal, ShieldAlert, Cpu } from "lucide-react";
import IntroductionModule from "@/modules/introduction";
import FundamentalsModule from "@/modules/fundamentals";
import ImagesModule from "@/modules/images";
import DockerfilesModule from "@/modules/dockerfiles";
import VolumesModule from "@/modules/volumes";
import NetworkingModule from "@/modules/networking";
import ComposeModule from "@/modules/compose";
import WrapupModule from "@/modules/wrapup";

interface ModulePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return modules.map((module) => ({
    slug: module.slug,
  }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const activeModule = getModuleBySlug(slug);

  if (!activeModule) {
    notFound();
  }

  const renderVisualization = () => {
    if (slug === "introduction") {
      return <IntroductionModule />;
    }
    if (slug === "fundamentals") {
      return <FundamentalsModule />;
    }
    if (slug === "images") {
      return <ImagesModule />;
    }
    if (slug === "dockerfiles") {
      return <DockerfilesModule />;
    }
    if (slug === "volumes") {
      return <VolumesModule />;
    }
    if (slug === "networking") {
      return <NetworkingModule />;
    }
    if (slug === "compose") {
      return <ComposeModule />;
    }
    if (slug === "wrapup") {
      return <WrapupModule />;
    }
    
    return (
      <div className="w-full max-w-lg p-8 rounded-[12px] border border-dashed border-[#2A2A2A] bg-[#111111] text-center flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm select-none">
        {/* Radial highlight in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FAFAFA]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Animated loader/placeholder graphic */}
        <div className="relative w-16 h-16 rounded-[9px] bg-[#171717] border border-[#2A2A2A] flex items-center justify-center mb-6 shadow-inner group">
          <Terminal className="w-7 h-7 text-[#A1A1AA] animate-pulse" />
        </div>

        <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-tight mb-2 uppercase font-mono">
          {activeModule.title} Sandbox
        </h3>
        
        <p className="text-xs text-[#A1A1AA] font-normal leading-relaxed max-w-sm mb-6 font-sans">
          This playground is scaffolding and ready for interactive animations. GSAP, Zustand stores, and layouts are fully connected. Next developer should mount the custom interactive layout here.
        </p>

        <div className="flex flex-col gap-2 w-full max-w-[280px]">
          <div className="p-3.5 rounded-[9px] border border-[#232323] bg-[#090909] text-left flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-[#A1A1AA] shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-[#FAFAFA] block font-sans">Visualizations Scaffolding</span>
              <span className="text-[10px] text-[#71717A] leading-normal block mt-0.5 font-sans">
                Expecting {activeModule.visualizationCount} live interactive steps.
              </span>
            </div>
          </div>
          
          <div className="p-3.5 rounded-[9px] border border-[#232323] bg-[#090909] text-left flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#A1A1AA] shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-[#FAFAFA] block font-sans">Workspace Isolated</span>
              <span className="text-[10px] text-[#71717A] leading-normal block mt-0.5 font-sans">
                Module runs in independent sandboxed client components.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ModuleLayout module={activeModule}>
      {renderVisualization()}
    </ModuleLayout>
  );
}
