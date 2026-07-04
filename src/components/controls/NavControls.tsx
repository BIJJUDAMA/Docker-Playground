"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimationStore } from "@/stores/animationStore";
import { cn } from "@/lib/utils";

interface NavControlsProps {
  prevSlug?: string;
  nextSlug?: string;
}

export default function NavControls({ prevSlug, nextSlug }: NavControlsProps) {
  const router = useRouter();
  const { activeStep, maxSteps, nextStep, prevStep } = useAnimationStore();

  const handlePrevClick = () => {
    if (activeStep > 0) {
      prevStep();
    } else if (prevSlug) {
      router.push(`/modules/${prevSlug}`);
    }
  };

  const handleNextClick = () => {
    if (activeStep < maxSteps - 1) {
      nextStep();
    } else if (nextSlug) {
      router.push(`/modules/${nextSlug}`);
    }
  };

  const hasPrev = activeStep > 0 || !!prevSlug;
  const hasNext = activeStep < maxSteps - 1 || !!nextSlug;

  return (
    <div className="flex items-center gap-2 select-none font-sans">
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrev}
        onClick={handlePrevClick}
        className={cn(
          "text-xs px-3.5 py-2 rounded-[6px] font-semibold transition-all flex items-center gap-1 cursor-pointer",
          hasPrev 
            ? "border-[#2A2A2A] bg-[#171717] hover:border-[#FAFAFA] hover:bg-[#151515] text-[#FAFAFA]" 
            : "border-[#232323] bg-[#090909] text-[#52525B] opacity-50 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-4 h-4 -ml-1 text-current" />
        Previous
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={handleNextClick}
        className={cn(
          "text-xs px-3.5 py-2 rounded-[6px] font-bold border-0 shadow-sm transition-all flex items-center gap-1 cursor-pointer",
          hasNext 
            ? "bg-[#FAFAFA] text-[#000000] hover:bg-[#FAFAFA]/95 font-bold" 
            : "border-[#232323] bg-[#090909] text-[#52525B] opacity-50 cursor-not-allowed font-semibold"
        )}
      >
        Next
        <ChevronRight className="w-4 h-4 -mr-1 text-current" />
      </Button>
    </div>
  );
}
