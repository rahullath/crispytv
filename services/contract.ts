import { ethers } from 'ethers';
import VideoPlatform from '../artifacts/contracts/VideoPlatform.sol/VideoPlatform.json';

export interface VideoData {
  title: string;
  description: string;
  category: string;
  ipfsHash: string;
  thumbnailHash: string;
}

export class ContractService {
  private static instance: ContractService;
  private contract: ethers.Contract;
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer;

  private constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
        VideoPlatform.abi,
        this.signer
      );
    }
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  async createVideo(videoData: VideoData): Promise<number> {
    try {
      const tx = await this.contract.createVideo(
        videoData.title,
        videoData.description,
        videoData.category,
        videoData.ipfsHash,
        videoData.thumbnailHash
      );
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'VideoCreated');
      return event?.args?.videoId.toNumber();
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  async processVideo(videoId: number, streamUrl: string): Promise<void> {
    try {
      const tx = await this.contract.processVideo(videoId, streamUrl);
      await tx.wait();
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  async addToWatchlist(videoId: number): Promise<void> {
    try {
      const tx = await this.contract.addToWatchlist(videoId);
      await tx.wait();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(videoId: number): Promise<void> {
    try {
      const tx = await this.contract.removeFromWatchlist(videoId);
      await tx.wait();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  async likeVideo(videoId: number): Promise<void> {
    try {
      const tx = await this.contract.likeVideo(videoId);
      await tx.wait();
    } catch (error) {
      console.error('Error liking video:', error);
      throw error;
    }
  }

  async dislikeVideo(videoId: number): Promise<void> {
    try {
      const tx = await this.contract.dislikeVideo(videoId);
      await tx.wait();
    } catch (error) {
      console.error('Error disliking video:', error);
      throw error;
    }
  }

  async getVideo(videoId: number): Promise<any> {
    try {
      return await this.contract.getVideo(videoId);
    } catch (error) {
      console.error('Error getting video:', error);
      throw error;
    }
  }

  async getUserWatchlist(userAddress: string): Promise<number[]> {
    try {
      return await this.contract.getUserWatchlist(userAddress);
    } catch (error) {
      console.error('Error getting user watchlist:', error);
      throw error;
    }
  }

  async hasUserLiked(videoId: number, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasUserLiked(videoId, userAddress);
    } catch (error) {
      console.error('Error checking if user liked video:', error);
      throw error;
    }
  }

  async hasUserDisliked(videoId: number, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasUserDisliked(videoId, userAddress);
    } catch (error) {
      console.error('Error checking if user disliked video:', error);
      throw error;
    }
  }

  async isInWatchlist(videoId: number, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.isInWatchlist(videoId, userAddress);
    } catch (error) {
      console.error('Error checking if video is in watchlist:', error);
      throw error;
    }
  }
}

export const contractService = ContractService.getInstance(); 