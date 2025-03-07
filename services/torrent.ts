import parseTorrent from 'parse-torrent';
import magnet from 'magnet-uri';
import { LivepeerService } from './livepeer';

interface TorrentInfo {
  title: string;
  size: number;
  category: string;
  description?: string;
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

interface MagnetInfo {
  name: string;
  length?: number;
  description?: string;
  files?: Array<{
    name: string;
    length: number;
    type: string;
  }>;
}

export class TorrentService {
  private static instance: TorrentService;
  private livepeer: LivepeerService;

  private constructor() {
    this.livepeer = LivepeerService.getInstance();
  }

  public static getInstance(): TorrentService {
    if (!TorrentService.instance) {
      TorrentService.instance = new TorrentService();
    }
    return TorrentService.instance;
  }

  public async processTorrent(magnetUri: string): Promise<{
    ipfsHash: string;
    playbackId: string;
    info: TorrentInfo;
  }> {
    try {
      // Parse magnet URI
      const torrentInfo = await this.getTorrentInfo(magnetUri);
      
      // Mock IPFS hash (in real implementation, this would be the actual IPFS hash)
      const ipfsHash = `mock-ipfs-${Date.now()}`;
      
      // Process with Livepeer
      const asset = await this.livepeer.processTorrentToVideo(ipfsHash, torrentInfo.title);
      
      return {
        ipfsHash,
        playbackId: asset.playbackId,
        info: torrentInfo,
      };
    } catch (error) {
      console.error('Error processing torrent:', error);
      throw error;
    }
  }

  public async getTorrentInfo(magnetUri: string): Promise<TorrentInfo> {
    try {
      const torrent = parseTorrent(magnetUri);
      const info = magnet.decode(magnetUri) as MagnetInfo;
      
      return {
        title: typeof info.name === 'string' ? info.name : 'Unknown Title',
        size: info.length || 0,
        category: this.detectCategory(typeof info.name === 'string' ? info.name : ''),
        description: info.description,
        files: info.files?.map(file => ({
          name: file.name,
          size: file.length,
          type: file.type
        })) || [],
      };
    } catch (error) {
      console.error('Error getting torrent info:', error);
      throw error;
    }
  }

  private detectCategory(filename: string): string {
    const categories = {
      movies: ['movie', 'film', 'cinema', 'hdrip', 'bluray', 'dvdrip'],
      tv: ['tv', 'show', 'series', 'episode', 'season'],
      music: ['music', 'album', 'song', 'track', 'concert'],
      gaming: ['game', 'gaming', 'playthrough', 'walkthrough'],
      education: ['tutorial', 'course', 'lecture', 'learning'],
      sports: ['sport', 'match', 'game', 'tournament'],
    };

    const filenameLower = filename.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => filenameLower.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }
} 