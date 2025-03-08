import { ethers } from 'ethers';

// Mock contract ABI for development
const MOCK_CONTRACT_ABI = [
  "function createVideo(string title, string description, string category, string ipfsHash, string thumbnailHash) public returns (uint256)",
  "function processVideo(uint256 videoId, string streamUrl) public",
  "function addToWatchlist(uint256 videoId) public",
  "function removeFromWatchlist(uint256 videoId) public",
  "function likeVideo(uint256 videoId) public",
  "function dislikeVideo(uint256 videoId) public",
  "function getVideo(uint256 videoId) public view returns (tuple(string title, string description, string category, string ipfsHash, string thumbnailHash, string streamUrl, uint256 likes, uint256 dislikes, bool isProcessed))",
  "function getUserWatchlist(address user) public view returns (uint256[])",
  "function hasUserLiked(uint256 videoId, address user) public view returns (bool)",
  "function hasUserDisliked(uint256 videoId, address user) public view returns (bool)",
  "function isInWatchlist(uint256 videoId, address user) public view returns (bool)",
  "event VideoCreated(uint256 indexed videoId, string title, address indexed author)",
  "event VideoProcessed(uint256 indexed videoId, string streamUrl)",
  "event AddedToWatchlist(uint256 indexed videoId, address indexed user)",
  "event RemovedFromWatchlist(uint256 indexed videoId, address indexed user)",
  "event VideoLiked(uint256 indexed videoId, address indexed user)",
  "event VideoDisliked(uint256 indexed videoId, address indexed user)"
];

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
    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        this.provider = new ethers.providers.Web3Provider(ethereum);
        this.signer = this.provider.getSigner();
        this.contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
          MOCK_CONTRACT_ABI,
          this.signer
        );
      }
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
      // Mock implementation for development
      console.log('Creating video:', videoData);
      return Math.floor(Math.random() * 1000);
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  async processVideo(videoId: number, streamUrl: string): Promise<void> {
    try {
      // Mock implementation for development
      console.log('Processing video:', videoId, streamUrl);
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  }

  async addToWatchlist(videoId: number): Promise<void> {
    try {
      // Mock implementation for development
      console.log('Adding to watchlist:', videoId);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(videoId: number): Promise<void> {
    try {
      // Mock implementation for development
      console.log('Removing from watchlist:', videoId);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  async likeVideo(videoId: number): Promise<void> {
    try {
      // Mock implementation for development
      console.log('Liking video:', videoId);
    } catch (error) {
      console.error('Error liking video:', error);
      throw error;
    }
  }

  async dislikeVideo(videoId: number): Promise<void> {
    try {
      // Mock implementation for development
      console.log('Disliking video:', videoId);
    } catch (error) {
      console.error('Error disliking video:', error);
      throw error;
    }
  }

  async getVideo(videoId: number): Promise<any> {
    try {
      // Mock implementation for development
      return {
        title: 'The Last Protocol',
        description: 'In a world where blockchain technology controls everything, one developer discovers a fatal flaw that could bring down the entire network. Now she must race against time to prevent digital chaos.',
        category: 'Sci-Fi Thriller',
        ipfsHash: 'https://cdn.livepeer.com/asset/mock-123/video.mp4',
        thumbnailHash: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80',
        streamUrl: 'https://cdn.livepeer.com/asset/mock-123/index.m3u8',
        likes: 1256,
        dislikes: 23,
        isProcessed: true
      };
    } catch (error) {
      console.error('Error getting video:', error);
      throw error;
    }
  }

  async getUserWatchlist(userAddress: string): Promise<number[]> {
    try {
      // Mock implementation for development
      return [1, 2, 3, 4, 5];
    } catch (error) {
      console.error('Error getting user watchlist:', error);
      throw error;
    }
  }

  async hasUserLiked(videoId: number, userAddress: string): Promise<boolean> {
    try {
      // Mock implementation for development
      return false;
    } catch (error) {
      console.error('Error checking if user liked video:', error);
      throw error;
    }
  }

  async hasUserDisliked(videoId: number, userAddress: string): Promise<boolean> {
    try {
      // Mock implementation for development
      return false;
    } catch (error) {
      console.error('Error checking if user disliked video:', error);
      throw error;
    }
  }

  async isInWatchlist(videoId: number, userAddress: string): Promise<boolean> {
    try {
      // Mock implementation for development
      return false;
    } catch (error) {
      console.error('Error checking if video is in watchlist:', error);
      throw error;
    }
  }
}

export const contractService = ContractService.getInstance(); 