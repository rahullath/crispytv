import { create } from 'livepeer';
import { ethers } from 'ethers';

// Initialize Livepeer client
const livepeer = create({
  apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API_KEY || '',
});

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
  private provider: ethers.providers.Web3Provider;

  private constructor() {
    // Initialize Web3 provider
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
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
      const asset = await livepeer.asset.create({
        name: options.name,
        input: options.input,
        storage: options.storage,
      });

      return asset;
    } catch (error) {
      console.error('Error creating video asset:', error);
      throw error;
    }
  }

  async getVideoAsset(assetId: string): Promise<VideoAsset> {
    try {
      const asset = await livepeer.asset.get(assetId);
      return asset;
    } catch (error) {
      console.error('Error getting video asset:', error);
      throw error;
    }
  }

  async deleteVideoAsset(assetId: string): Promise<void> {
    try {
      await livepeer.asset.delete(assetId);
    } catch (error) {
      console.error('Error deleting video asset:', error);
      throw error;
    }
  }

  async getPlaybackUrl(playbackId: string): Promise<string> {
    return `https://livepeercdn.com/${playbackId}/manifest.m3u8`;
  }

  async processTorrentToVideo(ipfsHash: string, name: string): Promise<VideoAsset> {
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