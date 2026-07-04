"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { modules } from "@/data/modules";
import { cn } from "@/lib/utils";
import { ChevronDown, GraduationCap } from "lucide-react";
import gsap from "gsap";

export default function ModuleSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const params = useParams();
  const activeSlug = (params.slug as string) || null;

  const currentModule = modules.find((m) => m.slug === activeSlug) || null;

  // Toggle dropdown with GSAP animation
  useEffect(() => {
    if (!dropdownRef.current) return;

    if (isOpen) {
      gsap.killTweensOf(dropdownRef.current);
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.95, y: -10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.18,
          ease: "power2.out",
          display: "block",
        }
      );
    } else {
      gsap.killTweensOf(dropdownRef.current);
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -10,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          if (dropdownRef.current) {
            dropdownRef.current.style.display = "none";
          }
        },
      });
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50">
      {/* Dropdown Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2.5 px-4 py-2 rounded-[9px] border border-[#2A2A2A] bg-[#111111] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#151515] transition-all text-xs font-semibold shadow-sm select-none cursor-pointer",
          isOpen && "border-[#FAFAFA] ring-1 ring-[#FAFAFA]/10"
        )}
      >
        <GraduationCap className="w-4 h-4 text-[#A1A1AA]" />
        <span>
          {currentModule ? `Module 0${currentModule.id}: ${currentModule.title}` : "Select Module"}
        </span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 text-[#71717A] transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown Menu Panel */}
      <div
        ref={dropdownRef}
        style={{ display: "none" }}
        className="absolute top-full left-0 mt-2 w-80 rounded-[9px] border border-[#2A2A2A] bg-[#111111] p-2.5 shadow-xl"
      >
        <div className="px-3.5 py-2 border-b border-[#232323] mb-2">
          <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#71717A]">
            Pathways Index
          </span>
        </div>

        <nav className="space-y-1 max-h-[380px] overflow-y-auto custom-scrollbar">
          {modules.map((module) => {
            const isActive = activeSlug === module.slug;

            return (
              <Link
                key={module.slug}
                href={`/modules/${module.slug}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-[6px] transition-all duration-150 cursor-pointer select-none",
                  isActive
                    ? "bg-[#0D0D0D] border-l-2 border-[#FAFAFA] text-[#FAFAFA] font-bold"
                    : "text-[#A1A1AA] hover:bg-[#0D0D0D]/60 hover:text-[#FAFAFA]"
                )}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#71717A]">
                    Module 0{module.id}
                  </span>
                  <span className="text-xs truncate">{module.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
