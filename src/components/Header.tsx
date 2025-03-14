import React from "react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  return (
    <header className={`pb-6 relative ${className}`}>
      <div className="flex items-center gap-4 mb-2">
        <Link href="/">
          <Image 
            src="/globe-logo.svg" 
            alt="Lumon Logo" 
            width={70} 
            height={36} 
            className="w-[77px] h-auto"
          />
        </Link>
        <h1 className="text-xl font-bold tracking-tighter text-black">
            Outie Query System Interface (OQSI)
        </h1>
      </div>
      <div className="absolute bottom-0 left-0 w-full">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="w-full h-[1px] bg-black mb-[2px] last:mb-0"
          />
        ))}
      </div>
    </header>
  );
} 