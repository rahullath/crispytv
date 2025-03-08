import { ethers } from 'ethers';

// Initialize Livepeer client with mock implementation for development
const livepeer = {
  // Mock implementation for development
  createAsset: async (options: any) => ({
    id: `mock-${Date.now()}`,
    playbackId: `mock-playback-${Date.now()}`,
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    duration: 0,
    name: options.name,
    input: {
      url: options.input,
    },
    output: {
      url: `https://mock-cdn.com/${options.input}`,
      playbackUrl: `https://mock-cdn.com/${options.input}/manifest.m3u8`,
    },
  }),
  getAsset: async (id: string) => ({
    id,
    playbackId: `mock-playback-${Date.now()}`,
    status: 'ready',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    duration: 0,
    name: 'Mock Video',
    input: {
      url: 'https://mock-cdn.com/video.mp4',
    },
    output: {
      url: 'https://mock-cdn.com/video.mp4',
      playbackUrl: 'https://mock-cdn.com/video/manifest.m3u8',
    },
  }),
  deleteAsset: async (id: string) => {
    console.log('Deleting asset:', id);
  },
};

export interface VideoProcessingOptions {
  name: string;
  input: string; // IPFS hash or URL
  storage?: {
    ipfs?: boolean;
  };
}

export interface VideoAsset {
  id: string;
  playbackId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  name: string;
  input: {
    url: string;
  };
  output: {
    url: string;
    playbackUrl: string;
  };
}

export class LivepeerService {
  private static instance: LivepeerService;
  private provider?: ethers.providers.Web3Provider;

  private constructor() {
    // Initialize Web3 provider only on client side
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        this.provider = new ethers.providers.Web3Provider(ethereum);
      }
    }
  }

  public static getInstance(): LivepeerService {
    if (!LivepeerService.instance) {
      LivepeerService.instance = new LivepeerService();
    }
    return LivepeerService.instance;
  }

  async createVideoAsset(options: VideoProcessingOptions): Promise<VideoAsset> {
    try {
      return await livepeer.createAsset(options);
    } catch (error) {
      console.error('Error creating video asset:', error);
      throw error;
    }
  }

  async getVideoAsset(assetId: string): Promise<VideoAsset> {
    try {
      return await livepeer.getAsset(assetId);
    } catch (error) {
      console.error('Error getting video asset:', error);
      throw error;
    }
  }

  async deleteVideoAsset(assetId: string): Promise<void> {
    try {
      await livepeer.deleteAsset(assetId);
    } catch (error) {
      console.error('Error deleting video asset:', error);
      throw error;
    }
  }

  async getPlaybackUrl(playbackId: string): Promise<string> {
    return `https://livepeercdn.com/${playbackId}/manifest.m3u8`;
  }

  async processTorrentToVideo(ipfsHash: string, name: string): Promise<VideoAsset> {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Return mock video asset
      return {
        id: `mock-${Date.now()}`,
        playbackId: `mock-playback-${Date.now()}`,
        status: 'ready',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: 0,
        name,
        input: {
          url: `ipfs://${ipfsHash}`,
        },
        output: {
          url: `https://mock-cdn.com/${ipfsHash}`,
          playbackUrl: `https://mock-cdn.com/${ipfsHash}/manifest.m3u8`,
        },
      };
    } catch (error) {
      console.error('Error processing torrent to video:', error);
      throw error;
    }
  }

  async checkProcessingStatus(assetId: string): Promise<string> {
    try {
      const asset = await this.getVideoAsset(assetId);
      return asset.status;
    } catch (error) {
      console.error('Error checking processing status:', error);
      throw error;
    }
  }
}

export const livepeerService = LivepeerService.getInstance(); 