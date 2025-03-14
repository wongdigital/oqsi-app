import { create } from 'zustand';

export type Track = {
  id: string;
  title: string;
  url: string;
};

interface MusicPlayerStore {
  // Player state
  isPlaying: boolean;
  currentTrackIndex: number;
  tracks: Track[];
  volume: number;
  
  // Controls
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  
  // Track management
  setTracks: (tracks: Track[]) => void;
  setCurrentTrackIndex: (index: number) => void;
  
  // Audio data for visualization
  audioData: number[];
  setAudioData: (data: number[]) => void;
}

export const useMusicPlayerStore = create<MusicPlayerStore>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTrackIndex: 0,
  tracks: [],
  volume: 1.0,
  audioData: Array(30).fill(0),
  
  // Controls
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  next: () => {
    const { currentTrackIndex, tracks } = get();
    if (tracks.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    set({ currentTrackIndex: nextIndex });
  },
  
  previous: () => {
    const { currentTrackIndex, tracks } = get();
    if (tracks.length === 0) return;
    
    const previousIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    set({ currentTrackIndex: previousIndex });
  },
  
  setVolume: (volume: number) => set({ volume }),
  
  // Track management
  setTracks: (tracks: Track[]) => set({ tracks }),
  setCurrentTrackIndex: (index: number) => set({ currentTrackIndex: index }),
  
  // Audio data for visualization
  setAudioData: (data: number[]) => set({ audioData: data }),
})); 