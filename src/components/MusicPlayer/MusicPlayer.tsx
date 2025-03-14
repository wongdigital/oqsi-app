'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMusicPlayerStore, Track } from '@/lib/music-player-store';
import { bunnyPlayer } from '@/lib/bunny-player';
import { cn } from '@/lib/utils';
import { PlayerPlay, PlayerPause } from '@/lib/icons';
import { Speaker } from '@/components/Speaker';
import { LightSwitch } from '@/components/LightSwitch';
import { useLightSwitchStore } from '@/lib/light-switch-store';

// Demo tracks using direct MP3 URLs for easier playback while testing
const DEMO_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Demo Track 1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Demo Track 2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
];

// Function to load tracks from Bunny.net
async function loadTracksFromBunny(): Promise<Track[]> {
  try {
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
    const pullZone = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;
    
    if (!libraryId || !pullZone) {
      throw new Error('Missing required Bunny environment variables');
    }

    const response = await fetch('/api/bunny/videos');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch videos');
    }

    const data = await response.json();
    
    // Transform Bunny videos into tracks using HLS playlist URLs
    const tracks: Track[] = data.items.map((video: any) => ({
      id: video.guid,
      title: video.title,
      url: `https://${pullZone}.b-cdn.net/${video.guid}/playlist.m3u8`,
    }));

    return tracks;
  } catch (error) {
    // Fallback to demo tracks if Bunny API fails
    return DEMO_TRACKS;
  }
}

export const MusicPlayer: React.FC = () => {
  const {
    isPlaying,
    currentTrackIndex,
    tracks,
    play,
    pause,
    togglePlayPause,
    setTracks,
  } = useMusicPlayerStore();
  
  const { isOn: isLightOn, toggle: toggleLight } = useLightSwitchStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);
  const tracksLoaded = useRef(false);
  const mountedRef = useRef(true);

  // Handle user interaction
  const handleUserInteraction = async () => {
    try {
      // Create and resume audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      }
      
      // Wait a small delay to ensure audio context is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setNeedsUserInteraction(false);
      await bunnyPlayer.play();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start playback');
    }
  };

  // Initialize the player
  useEffect(() => {
    mountedRef.current = true;

    const initPlayer = async () => {
      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize the player
        await bunnyPlayer.initialize();
        
        if (!mountedRef.current) return;
        
        // Set up event listeners
        bunnyPlayer.onPlay(() => {
          if (mountedRef.current) play();
        });
        
        bunnyPlayer.onPause(() => {
          if (mountedRef.current) pause();
        });

        bunnyPlayer.onError((error) => {
          if (mountedRef.current) {
            if (error.message.includes("user didn't interact with the document first")) {
              setNeedsUserInteraction(true);
              setError(null);
            } else {
              setError(error.message);
            }
          }
        });
        
        // Load tracks from Bunny.net (or use demo tracks for now)
        if (!tracksLoaded.current) {
          try {
            const tracksFromBunny = await loadTracksFromBunny();
            if (mountedRef.current) {
              setTracks(tracksFromBunny);
              tracksLoaded.current = true;
            }
          } catch (error) {
            throw error;
          }
        }
        
        if (mountedRef.current) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        if (mountedRef.current) {
          setError(error instanceof Error ? error.message : 'Failed to initialize player');
          setIsLoading(false);
        }
      }
    };
    
    initPlayer();
    
    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Handle track changes
  useEffect(() => {
    if (isInitialized && tracks.length > 0) {
      const loadNewTrack = async () => {
        try {
          setError(null);
          await bunnyPlayer.loadTrack(tracks[currentTrackIndex]);
          
          // Always try to play the new track if we're in a playing state
          if (isPlaying) {
            await bunnyPlayer.play();
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to load track');
        }
      };
      loadNewTrack();
    }
  }, [currentTrackIndex, tracks, isInitialized, isPlaying]);
  
  // Handle play/pause state
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (isPlaying) {
        if (needsUserInteraction) {
          setNeedsUserInteraction(true);
        } else {
          bunnyPlayer.play();
        }
      } else {
        bunnyPlayer.pause();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change play state');
    }
  }, [isPlaying, isInitialized, needsUserInteraction]);
  
  const handleTogglePlayPause = () => {
    togglePlayPause();
  };
  
  // Don't render if still loading or no tracks
  if (isLoading || !tracks.length) {
    return (
      <div className={cn(
        "fixed bg-white shadow-md px-6 py-4 z-[10000] flex items-center",
        // Default for mobile: full width with centered contents, no side borders, above 64px footer
        "w-full left-0 bottom-[64px] justify-center border-t border-black",
        // Medium screens and up: centered with fixed width and full borders
        "md:w-auto md:left-1/2 md:-translate-x-1/2 md:bottom-12 md:border md:border-black"
      )}>
        Loading player...
      </div>
    );
  }
  
  return (
    <div 
      ref={playerRef}
      className={cn(
        "fixed bg-white shadow-md px-6 py-4 z-[10000] flex items-center",
        // Default for mobile: full width with centered contents, no side borders, above 64px footer
        "w-full left-0 bottom-[64px] justify-center border-t border-black",
        // Medium screens and up: centered with fixed width and full borders
        "md:w-auto md:left-1/2 md:-translate-x-1/2 md:bottom-12 md:border md:border-black"
      )}
    >
      <div className="flex items-center space-x-6">
        {/* Error indicator */}
        {error && !needsUserInteraction && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-sm text-sm flex items-center space-x-2">
            <span>{error}</span>
          </div>
        )}
        
        {/* User interaction required message */}
        {needsUserInteraction && (
          <div 
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-sm text-sm flex items-center space-x-2 cursor-pointer hover:bg-yellow-600 transition-colors"
            onClick={handleUserInteraction}
          >
            <PlayerPlay size={14} />
            <span>Click to start playback</span>
          </div>
        )}
        
        {/* Play/Pause button */}
        <button 
          onClick={handleTogglePlayPause}
          className="hover:opacity-80 transition-opacity cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PlayerPause size={24} /> : <PlayerPlay size={24} />}
        </button>
        
        {/* Speaker */}
        <div 
          onClick={handleTogglePlayPause}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Speaker isPlaying={isPlaying} />
        </div>
        
        {/* Light Switch */}
        <LightSwitch 
          size={24} 
          initialState={isLightOn}
          onChange={toggleLight}
        />
      </div>
    </div>
  );
}; 