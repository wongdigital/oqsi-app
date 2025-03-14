'use client';

import React, { ReactNode } from "react";
import { Footer } from "./Footer";
import { GradientBackground } from "./GradientBackground";
import { useLightSwitchStore } from "@/lib/light-switch-store";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ 
  children, 
  className = ""
}: PageContainerProps) {
  const { isOn: isLightOn } = useLightSwitchStore();

  return (
    <div className="flex flex-col items-center min-h-screen p-0 bg-gray-400 relative max-[800px]:justify-start min-[801px]:justify-center">
      <div 
        className={`
          w-full max-w-[800px] h-[600px] bg-white border border-black shadow-md overflow-hidden p-6 flex flex-col relative
          max-[800px]:h-auto max-[800px]:min-h-[calc(100vh-121px)] max-[800px]:border-0 max-[800px]:shadow-none max-[800px]:m-0 max-[800px]:w-screen max-[800px]:max-w-none max-[800px]:bg-white max-[800px]:pb-[121px]
          min-[801px]:w-[800px] min-[801px]:h-[600px] min-[801px]:p-8
          ${className}
        `}
        style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
      >
        <GradientBackground isVisible={isLightOn} />
        <div className="relative z-20 flex-1 pb-8 sm:pb-0">
          {children}
        </div>
      </div>
      
      <footer className="w-full fixed bottom-0 left-0 text-center p-2 text-xs text-gray-800 bg-gray-400 z-[10000]">
        <Footer />
      </footer>
    </div>
  );
} 