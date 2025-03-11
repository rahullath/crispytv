import { livepeerService } from './livepeer';
import { TranscodeProfileEncoder, TranscodeProfileProfile } from 'livepeer/models/components';

export interface ContentMetadata {
  id: string;
  title: string;
  description: string;
  type: 'movie' | 'show' | 'special';
  genre: string[];
  releaseYear: number;
  rating: string;
  duration: number; // in minutes
  thumbnailUrl: string;
  trailerUrl?: string;
  // For TV Shows
  season?: number;
  episode?: number;
  seriesId?: string;
  // Decentralized storage metadata
  ipfsHash?: string;
  arweaveHash?: string;
  // Technical metadata
  sourceFile: string;
  playbackId?: string;
  quality: {
    resolution: string;
    bitrate: string;
  };
  // Additional metadata
  cast: string[];
  director: string[];
  languages: string[];
  subtitles: string[];
}

export interface StorageConfig {
  type: 'ipfs' | 'arweave';
  gateway?: string;
  apiKey?: string;
}

export interface ContentBatch {
  sourcePath: string;
  metadata: Partial<ContentMetadata>;
  files: string[];
}

export class ContentService {
  private static instance: ContentService;
  private storageConfig: StorageConfig;
  
  private constructor() {
    // Default to IPFS for testing
    this.storageConfig = {
      type: 'ipfs',
      gateway: 'https://ipfs.io/ipfs/'
    };
  }

  public static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  setStorageConfig(config: StorageConfig) {
    this.storageConfig = config;
  }

  async processContentBatch(batch: ContentBatch) {
    try {
      // 1. Validate files exist
      const validFiles = await this.validateFiles(batch.files);
      
      // 2. Process each file through decentralized storage
      for (const file of validFiles) {
        await this.processContent(file, batch.metadata);
      }
    } catch (error) {
      console.error('Error processing content batch:', error);
      throw error;
    }
  }

  private async validateFiles(files: string[]): Promise<string[]> {
    // Implementation would check if files exist and are valid video formats
    return files.filter(file => file.match(/\.(mp4|mkv|avi|mov)$/i));
  }

  private async uploadToDecentralizedStorage(file: string): Promise<string> {
    // Mock implementation - would integrate with actual IPFS/Arweave
    if (this.storageConfig.type === 'ipfs') {
      // Mock IPFS upload
      return `ipfs://${Math.random().toString(36).substring(7)}`;
    } else {
      // Mock Arweave upload
      return `ar://${Math.random().toString(36).substring(7)}`;
    }
  }

  private async processContent(file: string, baseMetadata: Partial<ContentMetadata>) {
    try {
      // 1. Upload to decentralized storage
      const contentHash = await this.uploadToDecentralizedStorage(file);
      
      // 2. Extract metadata from filename/path
      const extractedMetadata = this.extractMetadata(file);
      
      // 3. Merge with base metadata and add storage info
      const metadata: ContentMetadata = {
        ...baseMetadata,
        ...extractedMetadata,
        sourceFile: file,
        [this.storageConfig.type === 'ipfs' ? 'ipfsHash' : 'arweaveHash']: contentHash
      } as ContentMetadata;

      // 4. Start Livepeer transcoding process
      const fileBlob = await fetch(file).then(res => res.blob());
      const videoFile = new File([fileBlob], metadata.title, { type: 'video/mp4' });
      
      const asset = await livepeerService.createVideoAsset(videoFile, {
        title: metadata.title,
        description: metadata.description,
        staticMp4: true,
        profiles: [
          {
            width: 1280,
            name: "720p",
            height: 720,
            bitrate: 3000000,
            quality: 23,
            fps: 30,
            fpsDen: 1,
            gop: "2",
            profile: TranscodeProfileProfile.H264Baseline,
            encoder: TranscodeProfileEncoder.H264
          }
        ]
      });

      // 5. Update metadata with playback information
      metadata.playbackId = asset.playbackId;
      metadata.quality = {
        resolution: "720p",
        bitrate: "3 Mbps"
      };

      // 6. Store metadata (would go to MongoDB using credits)
      await this.storeMetadata(metadata);

      return metadata;
    } catch (error) {
      console.error('Error processing content:', error);
      throw error;
    }
  }

  private extractMetadata(filePath: string): Partial<ContentMetadata> {
    // Implementation would extract metadata from filename/path
    // Example: "Movies/Action/The.Matrix.1999.2160p.mkv"
    const parts = filePath.split('/');
    const filename = parts[parts.length - 1];
    
    // Basic extraction (would be more sophisticated in production)
    const match = filename.match(/^(.+?)\.(\d{4})\.(\d+p)\./);
    if (match) {
      return {
        title: match[1].replace(/\./g, ' '),
        releaseYear: parseInt(match[2]),
        quality: {
          resolution: match[3],
          bitrate: 'auto'
        }
      };
    }
    return {};
  }

  private async storeMetadata(metadata: ContentMetadata) {
    // Implementation would store metadata in a database
    console.log('Storing metadata:', metadata);
  }

  // Helper methods for content organization
  async getContentByGenre(genre: string): Promise<ContentMetadata[]> {
    // Implementation would fetch from database
    return [];
  }

  async getContentByType(type: 'movie' | 'show' | 'special'): Promise<ContentMetadata[]> {
    // Implementation would fetch from database
    return [];
  }

  async searchContent(query: string): Promise<ContentMetadata[]> {
    // Implementation would search in database
    return [];
  }
}

export const contentService = ContentService.getInstance(); 