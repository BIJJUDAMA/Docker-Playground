"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavControlsProps {
  prevSlug?: string;
  nextSlug?: string;
}

export default function NavControls({ prevSlug, nextSlug }: NavControlsProps) {
  return (
    <div className="flex items-center gap-2 select-none">
      {prevSlug ? (
        <Link
          href={`/modules/${prevSlug}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-[#2A2A2A] bg-[#171717] hover:border-[#FAFAFA] hover:bg-[#151515] text-[#FAFAFA] text-xs px-3.5 py-2 rounded-[6px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
          )}
        >
          <ChevronLeft className="w-4 h-4 -ml-1 text-[#A1A1AA]" />
          Previous
        </Link>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="border-[#232323] bg-[#090909] text-[#52525B] text-xs px-3.5 py-2 rounded-[6px] font-semibold opacity-50 cursor-not-allowed flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4 -ml-1 text-[#52525B]" />
          Previous
        </Button>
      )}

      {nextSlug ? (
        <Link
          href={`/modules/${nextSlug}`}
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "bg-[#FAFAFA] text-[#000000] hover:bg-[#FAFAFA]/95 text-xs px-3.5 py-2 rounded-[6px] font-bold border-0 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4 -mr-1 text-[#000000]" />
        </Link>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="border-[#232323] bg-[#090909] text-[#52525B] text-xs px-3.5 py-2 rounded-[6px] font-semibold opacity-50 cursor-not-allowed flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4 -mr-1 text-[#52525B]" />
        </Button>
      )}
    </div>
  );
}
