import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full relative">
      <div className="pb-6 relative">
        <Image 
          src="/globe-logo.svg" 
          alt="Lumon Logo" 
          width={175} 
          height={90} 
          priority
          style={{ width: '175px', height: '90px' }}
          className="mb-4"
        />
        <h1 className="mb-6 text-4xl sm:text-5xl font-bold tracking-tighter text-black">Outie Query <br />System Interface<br/>(OQSI)</h1>
        <div className="absolute bottom-0 left-0 w-full">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className="w-full h-[2px] bg-black mb-[2px] last:mb-0"
            />
          ))}
        </div>
      </div>
      
      <div className="sm:flex-1" />
      
      <div className="fixed sm:static bottom-[160px] sm:bottom-auto left-6 right-6 sm:left-auto sm:right-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <span className="text-lg sm:text-xl font-normal tracking-tighter text-black text-pretty">Describe your Innie to learn about your Outie.</span>
        <Link href="/observing" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}
