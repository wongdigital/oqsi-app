import { Track } from './music-player-store';
import Hls from 'hls.js';

class BunnyPlayerService {
  private playerId: string = 'bunny-player-container';
  private onPlayCallbacks: (() => void)[] = [];
  private onPauseCallbacks: (() => void)[] = [];
  private onTimeUpdateCallbacks: ((time: number) => void)[] = [];
  private onErrorCallbacks: ((error: Error) => void)[] = [];
  private onEndedCallbacks: (() => void)[] = [];
  private audioElement: HTMLAudioElement | null = null;
  private hls: Hls | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private isDisposed: boolean = false;
  private currentTrack: Track | null = null;
  private playerState: string = 'not initialized';

  constructor() {
    this.createPlayerElement();
  }

  private createPlayerElement(): void {
    if (typeof window === 'undefined') return;

    let playerElement = document.getElementById(this.playerId);
    if (!playerElement) {
      playerElement = document.createElement('div');
      playerElement.id = this.playerId;
      playerElement.style.position = 'fixed';
      playerElement.style.bottom = '0';
      playerElement.style.right = '0';
      playerElement.style.width = '300px';
      playerElement.style.height = '60px';
      playerElement.style.opacity = '0';
      playerElement.style.pointerEvents = 'none';
      playerElement.style.zIndex = '-1';
      playerElement.style.backgroundColor = 'transparent';
      playerElement.style.overflow = 'hidden';
      document.body.appendChild(playerElement);
    }

    // Create audio element
    this.audioElement = document.createElement('audio');
    this.audioElement.style.display = 'none';
    playerElement.appendChild(this.audioElement);

    // Set up audio event listeners
    this.audioElement.addEventListener('play', () => {
      this.onPlayCallbacks.forEach(callback => callback());
      this.showPlayer();
    });

    this.audioElement.addEventListener('pause', () => {
      this.onPauseCallbacks.forEach(callback => callback());
      this.hidePlayer();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.onTimeUpdateCallbacks.forEach(callback => 
          callback(this.audioElement!.currentTime)
        );
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.onPauseCallbacks.forEach(callback => callback());
      this.hidePlayer();
      // Trigger next track
      this.onEndedCallbacks.forEach(callback => callback());
    });

    this.audioElement.addEventListener('error', () => {
      const error = new Error('Audio playback error');
      this.onErrorCallbacks.forEach(callback => callback(error));
      this.hidePlayer();
    });
  }

  private showPlayer(): void {
    const container = document.getElementById(this.playerId);
    if (container) {
      container.style.opacity = '1';
      container.style.zIndex = '9999';
      container.style.pointerEvents = 'auto';
    }
  }

  private hidePlayer(): void {
    const container = document.getElementById(this.playerId);
    if (container) {
      container.style.opacity = '0';
      container.style.zIndex = '-1';
      container.style.pointerEvents = 'none';
    }
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    if (this.isInitialized) {
      return;
    }

    if (this.isDisposed) {
      this.isDisposed = false;
      this.isInitialized = false;
      this.initializationPromise = null;
    }
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = (async () => {
      try {
        this.createPlayerElement();
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize player:', error);
        this.isInitialized = false;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  public async loadTrack(track: Track): Promise<void> {
    if (!this.audioElement) {
      throw new Error('Player not initialized');
    }

    // Clean up existing HLS instance if any
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    // Create new HLS instance
    this.hls = new Hls({
      enableWorker: true,
    });

    // Bind HLS to audio element
    this.hls.attachMedia(this.audioElement);

    // Load the source
    this.hls.loadSource(track.url);

    // Wait for HLS to load
    await new Promise<void>((resolve, reject) => {
      if (!this.hls) {
        reject(new Error('HLS not initialized'));
        return;
      }

      const loadHandler = () => {
        this.hls?.off(Hls.Events.MANIFEST_LOADED, loadHandler);
        this.hls?.off(Hls.Events.ERROR, errorHandler);
        resolve();
      };

      const errorHandler = () => {
        this.hls?.off(Hls.Events.MANIFEST_LOADED, loadHandler);
        this.hls?.off(Hls.Events.ERROR, errorHandler);
        reject(new Error('Failed to load track'));
      };

      this.hls.on(Hls.Events.MANIFEST_LOADED, loadHandler);
      this.hls.on(Hls.Events.ERROR, errorHandler);
    });

    this.currentTrack = track;
    this.playerState = 'ready';
  }

  public async play(): Promise<void> {
    if (!this.audioElement) {
      throw new Error('Player not initialized');
    }

    try {
      await this.audioElement.play();
      this.playerState = 'playing';
    } catch (error) {
      console.error('Failed to play:', error);
      throw error;
    }
  }

  public async pause(): Promise<void> {
    if (!this.audioElement) {
      throw new Error('Player not initialized');
    }

    this.audioElement.pause();
    this.playerState = 'paused';
  }

  public setVolume(volume: number): void {
    if (!this.audioElement) {
      throw new Error('Player not initialized');
    }

    this.audioElement.volume = volume;
  }

  onPlay(callback: () => void): void {
    this.onPlayCallbacks.push(callback);
  }

  onPause(callback: () => void): void {
    this.onPauseCallbacks.push(callback);
  }

  onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  onEnded(callback: () => void): void {
    this.onEndedCallbacks.push(callback);
  }

  dispose(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.remove();
      this.audioElement = null;
    }
    
    this.isInitialized = false;
    this.isDisposed = true;
    this.currentTrack = null;
    this.onPlayCallbacks = [];
    this.onPauseCallbacks = [];
    this.onTimeUpdateCallbacks = [];
    this.onErrorCallbacks = [];
    this.onEndedCallbacks = [];
  }
}

export const bunnyPlayer = new BunnyPlayerService(); 