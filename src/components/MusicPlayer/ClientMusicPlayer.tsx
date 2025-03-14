'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import with no SSR in this client component
const DynamicMusicPlayer = dynamic(
  () => import('.').then(mod => mod.MusicPlayer),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed bottom-8 right-8 bg-black/80 backdrop-blur-md text-white p-3 rounded-full shadow-lg z-[10000]">
        Getting the maracas...
      </div>
    )
  }
);

export function ClientMusicPlayer() {
  return (
    <Suspense fallback={
      <div className="fixed bottom-8 right-8 bg-black/80 backdrop-blur-md text-white p-3 rounded-full shadow-lg z-[10000]">
        Getting the maracas...
      </div>
    }>
      <DynamicMusicPlayer />
    </Suspense>
  );
} 