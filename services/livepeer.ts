import { Livepeer } from 'livepeer';
import { TranscodeProfileEncoder, TranscodeProfileProfile } from 'livepeer/models/components';

export interface VideoAsset {
  id: string;
  playbackId: string;
  status: string;
  playbackUrl?: string;
  downloadUrl?: string;
}

export interface VideoProcessingOptions {
  title: string;
  description?: string;
  staticMp4?: boolean;
  profiles?: Array<{
    width: number;
    name: string;
    height: number;
    bitrate: number;
    quality: number;
    fps: number;
    fpsDen: number;
    gop: string;
    profile: TranscodeProfileProfile;
    encoder: TranscodeProfileEncoder;
  }>;
}

// Create the Livepeer client instance
const apiKey = process.env.NEXT_PUBLIC_LIVEPEER_API_KEY;
if (!apiKey) {
  throw new Error('LIVEPEER_API_KEY environment variable is not set');
}

// Initialize the Livepeer SDK client for API calls
export const livepeerClient = new Livepeer({
  apiKey,
});

export class LivepeerService {
  private static instance: LivepeerService;
  private livepeer;
  private apiKey: string;

  private constructor() {
    this.livepeer = livepeerClient;
    this.apiKey = apiKey || '';
  }

  public static getInstance(): LivepeerService {
    if (!LivepeerService.instance) {
      LivepeerService.instance = new LivepeerService();
    }
    return LivepeerService.instance;
  }

  // Helper function to convert a File to a base64 string
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/png;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  async createVideoAssetFromUrl(url: string, options: VideoProcessingOptions): Promise<VideoAsset> {
    try {
      console.log('Creating asset from URL:', url);
      
      // Extract clean filename from URL
      const filename = options.title || decodeURIComponent(url.split('/').pop() || 'video')
        .split('?')[0]
        .replace(/[^\w\s.-]/g, '_');

      // Step 1: Create the asset via URL
      const response = await this.livepeer.asset.create({
        name: filename,
        storage: {
          type: 'url',
          url
        },
        playbackPolicy: {
          type: 'public'
        },
        ...(options.staticMp4 && { export: { ipfs: true } })
      });

      // Log the full response for debugging
      console.log('Raw asset response:', {
        response,
        type: typeof response,
        keys: Object.keys(response || {}),
        data: response?.data,
        asset: response?.asset
      });

      // Extract asset data from response based on SDK v3.5.0 format
      const assetData = response?.data?.asset || response?.asset || response?.data || response;

      if (!assetData?.id) {
        // Log the extracted data for debugging
        console.error('Invalid asset data:', {
          assetData,
          extractionPath: {
            hasData: !!response?.data,
            hasAsset: !!response?.asset,
            hasDirectId: !!response?.id
          }
        });
        throw new Error('Failed to create asset: Missing asset ID in response');
      }

      console.log('Extracted asset data:', assetData);

      // Step 2: Poll for asset status until it's ready or fails
      const maxAttempts = 60; // 5 minutes total (5s * 60)
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        const assetInfo = await this.livepeer.asset.get(assetData.id);
        console.log('Asset status check:', {
          id: assetInfo?.id,
          status: assetInfo?.status,
          phase: assetInfo?.status?.phase,
          progress: assetInfo?.status?.progress,
          errorMessage: assetInfo?.status?.errorMessage,
          tasks: assetInfo?.status?.tasks
        });

        if (!assetInfo) {
          throw new Error('Failed to get asset info');
        }

        const status = assetInfo.status?.phase;
        const progress = assetInfo.status?.progress;
        
        if (status === 'ready') {
          console.log('Asset is ready:', assetInfo);
          return {
            id: assetInfo.id,
            playbackId: assetInfo.playbackId || '',
            status: status,
            playbackUrl: assetInfo.playbackUrl || '',
            downloadUrl: assetInfo.downloadUrl || '',
          };
        } else if (status === 'failed') {
          const error = assetInfo.status?.errorMessage || 'Unknown error';
          console.error('Asset processing failed:', {
            error,
            status: assetInfo.status,
            tasks: assetInfo.status?.tasks
          });
          throw new Error(`Asset processing failed: ${error}`);
        } else if (status === 'waiting' || status === 'processing') {
          // Continue polling
          console.log(`Asset processing: ${progress || 0}% complete`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;
          continue;
        } else {
          throw new Error(`Unknown asset status: ${status}`);
        }
      }

      throw new Error('Asset processing timed out');
    } catch (error) {
      console.error('Error creating video asset from URL:', error);
      throw error;
    }
  }

  async createVideoAsset(
    file: File, 
    options: VideoProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<VideoAsset> {
    try {
      console.log('Creating video asset from file:', file.name);

      // Step 1: Request upload URL
      const response = await fetch('https://livepeer.studio/api/asset/request-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: options.title || file.name
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to request upload URL: ${response.status}`);
      }

      const uploadData = await response.json();
      console.log('Upload request response:', uploadData);

      if (!uploadData?.url) {
        throw new Error('Failed to get upload URL from response');
      }

      // Step 2: Upload the file with progress tracking
      console.log('Starting file upload...');
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${progress}%`);
          onProgress?.(progress);
        }
      };

      // Create promise to handle upload completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      // Start the upload
      xhr.open('PUT', uploadData.url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      // Wait for upload to complete
      await uploadPromise;
      console.log('File upload completed');

      // Step 3: Get asset data
      const assetData = uploadData.asset;
      if (!assetData?.id) {
        throw new Error('Failed to get asset ID from response');
      }

      console.log('Asset data:', assetData);

      // Step 4: Poll for asset status
      const maxAttempts = 60; // 5 minutes total (5s * 60)
      let attempts = 0;

      while (attempts < maxAttempts) {
        const assetInfo = await this.livepeer.asset.get(assetData.id);
        console.log('Asset status check response:', JSON.stringify(assetInfo, null, 2));

        // Get the asset data from the response
        const asset = assetInfo?.asset || assetInfo;
        if (!asset) {
          console.warn('No asset data in response');
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;
          continue;
        }

        // Check the status
        const status = asset.status?.phase;
        const progress = asset.status?.progress || 0;

        console.log('Status check:', {
          status,
          progress,
          assetId: assetData.id
        });

        if (status === 'ready' || status === 'completed') {
          return {
            id: asset.id,
            playbackId: asset.playbackId,
            status: status,
            playbackUrl: asset.playbackUrl || `https://lp-playback.com/hls/${asset.playbackId}/index.m3u8`,
            downloadUrl: asset.downloadUrl
          };
        } else if (status === 'failed') {
          const error = asset.status?.errorMessage || 'Unknown error';
          throw new Error(`Asset processing failed: ${error}`);
        } else if (status === 'waiting' || status === 'processing' || status === 'uploading') {
          console.log(`Asset processing: ${progress}% complete`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;
          continue;
        } else {
          console.warn('Unknown status:', status);
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;
          continue;
        }
      }

      throw new Error('Asset processing timed out');
    } catch (error) {
      console.error('Error creating video asset:', error);
      throw error;
    }
  }

  async processTorrentToVideo(torrentFile: string | File, options: VideoProcessingOptions): Promise<{ infoHash: string; playbackId: string; info: any }> {
    try {
      // Check if the input is a URL
      if (typeof torrentFile === 'string' && torrentFile.startsWith('http')) {
        console.log('Processing URL as video source:', torrentFile);
        
        // Create video asset with Livepeer from URL
        const asset = await this.createVideoAssetFromUrl(torrentFile, options);
        
        if (!asset || !asset.playbackId) {
          throw new Error('Failed to create video asset from URL');
        }

        return {
          infoHash: 'url-source-' + Date.now(),
          playbackId: asset.playbackId,
          info: {
            title: options.title || 'Video from URL',
            size: 0, // Size unknown for URL sources
            type: 'video/mp4',
            asset
          }
        };
      } else {
        // Handle file upload as before
        let file: File;
        
        // Convert string to File if needed (for non-URL strings)
        if (typeof torrentFile === 'string') {
          const response = await fetch(torrentFile);
          const blob = await response.blob();
          file = new File([blob], 'video.mp4', { type: 'video/mp4' });
        } else {
          file = torrentFile;
        }

        console.log('Processing torrent file:', file.name);

        // Create video asset with Livepeer
        const asset = await this.createVideoAsset(file, options);
        
        if (!asset || !asset.playbackId) {
          throw new Error('Failed to create video asset');
        }

        return {
          infoHash: 'mock-info-hash-' + Date.now(), // This will be set by the torrent service
          playbackId: asset.playbackId,
          info: {
            title: file.name,
            size: file.size,
            type: file.type,
            asset
          }
        };
      }
    } catch (error) {
      console.error('Error processing torrent to video:', error);
      throw error;
    }
  }

  async getPlaybackInfo(playbackId: string) {
    try {
      const result = await this.livepeer.playback.get(playbackId);
      return result;
    } catch (error) {
      console.error('Error getting playback info:', error);
      throw error;
    }
  }

  async getVideoAsset(assetId: string): Promise<VideoAsset | null> {
    try {
      const result = await this.livepeer.asset.get(assetId);
      if (!result) return null;

      return {
        id: result.id,
        playbackId: result.playbackId,
        status: result.status?.phase || 'unknown',
        playbackUrl: result.playbackUrl,
        downloadUrl: result.downloadUrl,
      };
    } catch (error) {
      console.error('Error getting video asset:', error);
      return null;
    }
  }

  async checkProcessingStatus(assetId: string): Promise<string> {
    const asset = await this.getVideoAsset(assetId);
    return asset?.status || 'unknown';
  }

  getPlaybackUrl(playbackId: string): string {
    return `https://lp-playback.com/hls/${playbackId}/index.m3u8`;
  }
}

// Export a default instance for backward compatibility
export const livepeerService = LivepeerService.getInstance();