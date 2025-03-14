import React, { ReactNode } from "react";
import { Header } from "./Header";

interface ContentPageTemplateProps {
  children: ReactNode;
  className?: string;
}

export function ContentPageTemplate({ 
  children, 
  className = "" 
}: ContentPageTemplateProps) {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className={`flex-1 flex flex-col min-[801px]:overflow-auto ${className}`}>
        <div className="flex-1 flex min-[801px]:items-center min-[801px]:justify-center min-[801px]:min-h-[400px]">
          <div className="w-full max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 