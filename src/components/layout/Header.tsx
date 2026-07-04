"use client";

import Link from "next/link";
import ModuleSelector from "./ModuleSelector";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232323] bg-[#090909]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm select-none">
      {/* Left side: Brand Logo + Module Selector next to it */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/docker-playground.webp" 
            alt="Docker Playground Logo" 
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-300 shrink-0" 
          />
          <div className="hidden sm:block">
            <h1 className="font-sans font-bold text-base tracking-tight text-[#FAFAFA] flex items-center gap-1.5">
              Docker <span className="text-[#A1A1AA]">Playground</span>
            </h1>
            <span className="text-[9px] text-[#71717A] uppercase tracking-widest block font-medium -mt-1">
              Interactive Visual Guide
            </span>
          </div>
        </Link>
        
        {/* Module Selector Dropdown */}
        <div className="h-4 w-px bg-[#232323] hidden md:block" />
        <ModuleSelector />
      </div>
    </header>
  );
}

