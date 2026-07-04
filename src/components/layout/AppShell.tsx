"use client";

import React from "react";
import Header from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FAFAFA] flex flex-col font-sans selection:bg-[#FAFAFA]/20 selection:text-white relative overflow-hidden">
      
      {/* Main app container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-[1600px] w-full mx-auto border-x border-[#232323] bg-[#090909]">
        <Header />
        
        <div className="flex-1 flex items-stretch min-h-0 bg-[#0D0D0D]">
          <main className="flex-1 overflow-y-auto h-[calc(100vh-73px)] relative flex flex-col">
            {children}
          </main>
        </div>
      </div>

    </div>
  );
}

