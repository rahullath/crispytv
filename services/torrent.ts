import parseTorrent from 'parse-torrent';
import * as magnetUri from 'magnet-uri';
import { LivepeerService, VideoProcessingOptions } from './livepeer';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { TranscodeProfileEncoder, TranscodeProfileProfile } from 'livepeer/models/components';

// WebRTC connection check configuration
const STUN_SERVERS = [
  // Use only the most reliable STUN servers
  { urls: ['stun:stun.l.google.com:19302'] },
  // Keep one TURN server as backup
  {
    urls: [
      'turn:openrelay.metered.ca:443?transport=tcp'
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

// WebRTC connection check configuration
const WEBRTC_CONFIG: RTCConfiguration = {
  iceServers: STUN_SERVERS,
  iceTransportPolicy: 'all' as RTCIceTransportPolicy,
  bundlePolicy: 'max-bundle' as RTCBundlePolicy,
  rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
  iceCandidatePoolSize: 5 // Reduced from 10
};

// Only initialize WebTorrent on the client side
let webTorrentClient: any = null;

const TRACKERS = [
  'wss://tracker.webtorrent.dev',
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce'
];

// Initialize WebTorrent client (only in browser)
if (typeof window !== 'undefined') {
  console.log('Browser Info:', {
    userAgent: navigator.userAgent,
    isFirefox: navigator.userAgent.includes('Firefox'),
    webRTCSupport: 'RTCPeerConnection' in window
  });

  // Dynamically import WebTorrent only on the client side
  import('webtorrent/dist/webtorrent.min.js').then((WebTorrent) => {
    checkWebRTCSupport().then(({ isSupported, error }) => {
      if (!isSupported) {
        console.error('WebRTC is not supported:', error);
        toast.error('WebRTC is not supported or is blocked in your browser. Please enable it in your browser settings.');
        return;
      }

      try {
        const config = {
          tracker: {
            announce: TRACKERS,
            rtcConfig: WEBRTC_CONFIG,
            // Add connection monitoring options
            maxRetries: 5,
            retryInterval: 5000,
            timeout: 15000,
            // Add WebSocket configuration
            wsOpts: {
              // Increase timeout for WebSocket connections
              timeout: 10000,
              // Add reconnection options
              reconnect: true,
              reconnectInterval: 5000,
              maxReconnectAttempts: 5
            }
          },
          // Enable more detailed logging
          maxConns: 55,        // Max number of connections per torrent
          uploadRateLimit: 0,  // Unlimited upload
          downloadRateLimit: 0, // Unlimited download
          // Add more detailed error handling
          debug: true,
          // Add connection options
          connectionTimeout: 10000,
          // Add retry options
          retries: 5,
          retryInterval: 5000
        };

        console.log('Initializing WebTorrent with config:', config);
        webTorrentClient = new WebTorrent.default(config);
        
        // Add more detailed event listeners
        webTorrentClient.on('error', (err: Error) => {
          console.error('WebTorrent client error:', err);
          toast.error('WebTorrent client error: ' + err.message);
        });

        webTorrentClient.on('warning', (err: Error) => {
          console.warn('WebTorrent client warning:', err);
        });

        // Log when peers are found/connected
        webTorrentClient.on('peer', (peer: any) => {
          console.log('Found peer:', {
            address: peer.remoteAddress,
            port: peer.remotePort,
            type: peer.type // 'webrtc' or 'tcp'
          });
        });

        // Add tracker connection monitoring
        webTorrentClient.on('trackerAnnounce', (announceType: string, eventData: any) => {
          console.log('Tracker announce:', announceType, eventData);
        });

        webTorrentClient.on('trackerError', (err: Error, announceType: string) => {
          console.warn('Tracker error:', announceType, err);
          // Don't show error toast for tracker errors as they're common
        });

        console.log('WebTorrent client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize WebTorrent client:', error);
        toast.error('Failed to initialize WebTorrent client. Please check your browser settings.');
      }
    });
  }).catch(error => {
    console.error('Failed to import WebTorrent:', error);
    toast.error('Failed to load WebTorrent. Please check your browser settings.');
  });
}

/**
 * Check if WebRTC is supported and allowed in the browser
 */
async function checkWebRTCSupport(): Promise<{ isSupported: boolean; error?: string }> {
  try {
    // Check if required APIs exist
    if (!window.RTCPeerConnection) {
      return { isSupported: false, error: 'WebRTC is not supported in this browser' };
    }

    // Create a test peer connection with our enhanced configuration
    const pc = new RTCPeerConnection(WEBRTC_CONFIG);
    
    // Create a test data channel
    const dc = pc.createDataChannel('test');

    // Set up event handlers
    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection State:', pc.connectionState);
    };

    pc.onicegatheringstatechange = () => {
      console.log('ICE Gathering State:', pc.iceGatheringState);
    };

    // Create and set local description
    const offer = await pc.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    });
    
    await pc.setLocalDescription(offer);

    // Wait for ICE gathering
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('ICE gathering timed out'));
      }, 5000);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate found');
          clearTimeout(timeout);
          resolve();
        }
      };
    });

    // Cleanup
    dc.close();
    pc.close();

    return { isSupported: true };
  } catch (error) {
    console.error('WebRTC Check Error:', error);
    
    // Check if it's Firefox
    if (navigator.userAgent.includes('Firefox')) {
      return { 
        isSupported: false, 
        error: `WebRTC is blocked in Firefox. Please enable it:
1. Open about:config in Firefox
2. Search for "media.peerconnection.enabled"
3. Set it to "true"
4. Restart Firefox`
      };
    }
    
    // Check if it's Chrome
    if (navigator.userAgent.includes('Chrome')) {
      return { 
        isSupported: false, 
        error: `WebRTC is blocked in Chrome. Please enable it:
1. Open chrome://flags
2. Search for "WebRTC"
3. Make sure "WebRTC" is enabled
4. Restart Chrome`
      };
    }

    return { 
      isSupported: false, 
      error: `WebRTC is not supported or is blocked. Please check your browser settings and firewall configuration.`
    };
  }
}

interface ParsedTorrent {
  infoHash: string;
  name?: string;
  length?: number;
  files?: Array<{
    name: string;
    length: number;
    path: string;
  }>;
  announce?: string[];
  announceList?: string[][];
  urlList?: string[];
  comment?: string;
  private?: boolean;
  info?: any;
  created?: Date;
  createdBy?: string;
  isPrivate?: boolean;
  pieceLength?: number;
  lastPieceLength?: number;
  pieces?: string[];
}

interface TorrentInfo {
  infoHash: string;
  title: string;
  size: number;
  description: string;
  files: TorrentFile[];
  category?: string;
}

interface MagnetInfo {
  name: string;
  length?: number;
  description?: string;
  infoHash?: string;
  files?: TorrentFile[];
}

interface TorrentStreamInfo {
  infoHash: string;
  magnetURI: string;
  files: Array<{
    name: string;
    path: string;
    size: number;
    type: string;
    streamURL?: string;
  }>;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  ready: boolean;
  torrent?: any;
}

interface ProcessedTorrent {
  infoHash: string;
  playbackId: string;
  name: string;
  status: string;
  playbackUrl: string;
}

interface TorrentFile {
  name: string;
  size: number;
  path: string;
  type?: string;
}

export class TorrentService {
  private static instance: TorrentService;
  private client: any | null = null;
  private readonly livepeer: LivepeerService;
  private isClient: boolean;
  private webrtcSupported: boolean = false;
  private webrtcError?: string;

  private constructor() {
    this.livepeer = LivepeerService.getInstance();
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.checkWebRTCSupport();
    }
  }

  private async checkWebRTCSupport() {
    try {
      const RTCPeerConnection = window.RTCPeerConnection || 
        (window as any).webkitRTCPeerConnection || 
        (window as any).mozRTCPeerConnection;

      if (!RTCPeerConnection) {
        throw new Error('WebRTC is not supported in this browser');
      }

      const pc = new RTCPeerConnection();
      pc.close();
      
      this.webrtcSupported = true;
    } catch (error) {
      console.error('WebRTC Support Error:', error);
      this.webrtcSupported = false;
      this.webrtcError = error instanceof Error ? error.message : 'WebRTC initialization failed';
    }
  }

  public isWebRTCSupported(): { supported: boolean; error?: string } {
    return {
      supported: this.webrtcSupported,
      error: this.webrtcError
    };
  }

  /**
   * Process a torrent from a magnet URI or video URL
   */
  public async processTorrent(input: string): Promise<ProcessedTorrent> {
    try {
      // Check if input is a video URL
      const isVideoUrl = /\.(mp4|mkv|mov|avi|webm)(\?|$)/i.test(input);
      
      if (isVideoUrl) {
        console.log('Processing direct video URL:', input);
        
        // Extract filename from URL and clean it
        const urlObj = new URL(input);
        const filename = decodeURIComponent(urlObj.pathname.split('/').pop() || 'video')
          .split('?')[0]
          .replace(/[^\w\s.-]/g, '_');
        
        // Create video asset from URL using Livepeer SDK v3.5.0
        const asset = await this.livepeer.createVideoAssetFromUrl(input, {
          title: filename,
          staticMp4: true
        });

        if (!asset?.playbackId) {
          throw new Error('Failed to get playback ID from asset');
        }

        return {
          infoHash: asset.id,
          playbackId: asset.playbackId,
          name: filename,
          status: asset.status || 'ready',
          playbackUrl: asset.playbackUrl || ''
        };
      }

      // Handle magnet URI
      const torrentInfo = await this.getTorrentInfo(input);
      console.log('Torrent info:', torrentInfo);

      // Find the largest video file
      const videoFile = this.findLargestVideoFile(torrentInfo.files);
      if (!videoFile) {
        throw new Error('No video file found in torrent');
      }

      // Create asset from URL if available
      const asset = await this.livepeer.createVideoAssetFromUrl(videoFile.path, {
        title: torrentInfo.title || videoFile.name,
        staticMp4: true
      });

      if (!asset?.playbackId) {
        throw new Error('Failed to get playback ID from asset');
      }

      return {
        infoHash: torrentInfo.infoHash,
        playbackId: asset.playbackId,
        name: torrentInfo.title || videoFile.name,
        status: asset.status || 'ready',
        playbackUrl: asset.playbackUrl || ''
      };
    } catch (error) {
      console.error('Error in processTorrent:', error);
      throw error instanceof Error ? error : new Error('Unknown error in processTorrent');
    }
  }

  private findLargestVideoFile(files: TorrentFile[]): TorrentFile | null {
    if (!files || !Array.isArray(files)) {
      return null;
    }

    // Filter for video files and sort by size
    const videoFiles = files
      .filter(file => /\.(mp4|mkv|mov|avi|webm)$/i.test(file.name))
      .sort((a, b) => b.size - a.size);

    return videoFiles[0] || null;
  }

  /**
   * Get information about a torrent from its magnet URI or file name
   */
  private async getTorrentInfo(input: string): Promise<TorrentInfo> {
    try {
      if (input.startsWith('magnet:')) {
        // Parse magnet URI
        const match = input.match(/xt=urn:btih:([a-fA-F0-9]+)/);
        if (!match) {
          throw new Error('Invalid magnet URI format');
        }

        const infoHash = match[1].toLowerCase();
        const nameMatch = input.match(/dn=([^&]+)/);
        const lengthMatch = input.match(/xl=(\d+)/);
        const trackers = (input.match(/tr=([^&]+)/g) || []).map(tr => decodeURIComponent(tr.substr(3)));

        console.log('Parsed magnet URI:', {
          infoHash,
          name: nameMatch ? decodeURIComponent(nameMatch[1]) : 'Unknown',
          trackers
        });

        // Return parsed torrent info
        return {
          infoHash,
          title: nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : 'Unknown Title',
          size: lengthMatch ? parseInt(lengthMatch[1]) : 0,
          description: '',
          files: [],
          category: this.detectCategory(nameMatch ? decodeURIComponent(nameMatch[1]) : '')
        };
      } else {
        // Handle file name input
        return {
          infoHash: '',
          title: input,
          size: 0,
          description: '',
          files: [{
            name: input,
            size: 0,
            path: input
          }],
          category: this.detectCategory(input)
        };
      }
    } catch (error) {
      console.error('Error getting torrent info:', error);
      throw error;
    }
  }

  /**
   * Detect content category from name
   */
  private detectCategory(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('movie') || lowerName.match(/\b(1080p|720p|bluray|brrip|dvdrip)\b/)) {
      return 'movie';
    } else if (lowerName.match(/s\d{2}e\d{2}/i) || lowerName.includes('episode')) {
      return 'tv';
    } else {
      return 'video';
    }
  }

  /**
   * Start streaming a torrent from a magnet URI
   */
  public startTorrentStream(magnetUri: string): Promise<TorrentStreamInfo> {
    return new Promise((resolve, reject) => {
      if (!this.isClient) {
        reject(new Error('WebTorrent can only be used in the browser'));
        return;
      }

      if (!webTorrentClient) {
        reject(new Error('WebTorrent client is not initialized'));
        return;
      }

      try {
        console.log('Starting torrent stream for:', magnetUri);
        
        // Try to parse the magnet URI
        let parsed: ParsedTorrent;
        try {
          parsed = parseTorrent(magnetUri) as ParsedTorrent;
        } catch (parseError) {
          console.error('Parse error in startTorrentStream:', parseError);
          const match = magnetUri.match(/magnet:\?xt=urn:btih:([a-zA-Z0-9]+)/);
          if (!match) {
            throw new Error('Invalid magnet URI format');
          }
          parsed = { infoHash: match[1].toLowerCase() } as ParsedTorrent;
        }

        const infoHash = parsed.infoHash;
        console.log('Parsed info hash:', infoHash);
        
        // Check if we're already downloading this torrent
        if (this.activeTorrents.has(infoHash)) {
          console.log('Torrent already exists, returning existing stream info');
          resolve(this.activeTorrents.get(infoHash)!);
          return;
        }
        
        // Initialize stream info
        const streamInfo: TorrentStreamInfo = {
          infoHash,
          magnetURI: magnetUri,
          files: [],
          progress: 0,
          downloadSpeed: 0,
          uploadSpeed: 0,
          numPeers: 0,
          ready: false
        };
        
        this.activeTorrents.set(infoHash, streamInfo);
        
        console.log('Adding torrent to WebTorrent client');
        // Add the torrent to the client
        webTorrentClient.add(magnetUri, {
          announce: TRACKERS,
          path: './.torrents' // Store files in a specific directory
        }, (torrent) => {
          console.log('Torrent added successfully');
          console.log('Torrent info:', {
            name: torrent.name,
            infoHash: torrent.infoHash,
            files: torrent.files.map(f => ({ name: f.name, length: f.length }))
          });
          
          // Update stream info with torrent data
          streamInfo.torrent = torrent;
          streamInfo.files = torrent.files.map(file => ({
            name: file.name,
            path: file.path,
            size: file.length,
            type: this.getFileType(file.name),
            streamURL: URL.createObjectURL(new Blob([], { type: this.getMimeType(file.name) }))
          }));
          
          // Set up streaming URLs for each file
          streamInfo.files.forEach((fileInfo, index) => {
            const file = torrent.files[index];
            console.log('Setting up streaming for file:', fileInfo.name);
            
            // Create a MediaSource for video/audio files
            if (['video', 'audio'].includes(fileInfo.type)) {
              try {
                const mediaSource = new MediaSource();
                const videoUrl = URL.createObjectURL(mediaSource);
                fileInfo.streamURL = videoUrl;
                
                let sourceBuffer: SourceBuffer | null = null;
                let queue: ArrayBuffer[] = [];
                let isPlaying = false;
                
                mediaSource.addEventListener('sourceopen', () => {
                  try {
                    sourceBuffer = mediaSource.addSourceBuffer(this.getMimeType(fileInfo.name));
                    
                    sourceBuffer.addEventListener('updateend', () => {
                      if (!sourceBuffer?.updating && queue.length > 0) {
                        sourceBuffer?.appendBuffer(queue.shift()!);
                      } else if (!sourceBuffer?.updating && mediaSource.readyState === 'open') {
                        mediaSource.endOfStream();
                      }
                    });
                    
                    // Stream the file to the source buffer
                    file.createReadStream().on('data', (chunk) => {
                      if (!sourceBuffer?.updating) {
                        sourceBuffer?.appendBuffer(chunk);
                      } else {
                        queue.push(chunk);
                      }
                    });
                    
                    // Handle stream end
                    file.createReadStream().on('end', () => {
                      if (queue.length === 0 && !sourceBuffer?.updating) {
                        mediaSource.endOfStream();
                      }
                    });
                    
                    console.log('MediaSource setup complete for:', fileInfo.name);
                  } catch (err) {
                    console.error('Error setting up source buffer:', err);
                    // Fallback to blob URL if source buffer setup fails
                    this.setupFallbackBlobUrl(file, fileInfo);
                  }
                });
                
                // Handle MediaSource errors
                mediaSource.addEventListener('error', (err) => {
                  console.error('MediaSource error:', err);
                  this.setupFallbackBlobUrl(file, fileInfo);
                });
                
                console.log('MediaSource created for:', fileInfo.name);
              } catch (err) {
                console.error('Error creating MediaSource:', err);
                this.setupFallbackBlobUrl(file, fileInfo);
              }
            } else {
              // For non-media files, use regular blob URL
              this.setupFallbackBlobUrl(file, fileInfo);
            }
          });
          
          streamInfo.ready = true;
          
          // Set up event listeners for torrent progress
          torrent.on('download', () => {
            streamInfo.progress = torrent.progress;
            streamInfo.downloadSpeed = torrent.downloadSpeed;
            streamInfo.uploadSpeed = torrent.uploadSpeed;
            streamInfo.numPeers = torrent.numPeers;
            console.log(
              'Progress:', Math.round(torrent.progress * 100) + '%',
              'Download speed:', (torrent.downloadSpeed / 1024 / 1024).toFixed(2) + 'MB/s',
              'Upload speed:', (torrent.uploadSpeed / 1024 / 1024).toFixed(2) + 'MB/s',
              'Peers:', torrent.numPeers
            );
          });
          
          torrent.on('done', () => {
            console.log('Torrent download finished:', torrent.name);
            streamInfo.progress = 1;
          });
          
          torrent.on('error', (err) => {
            console.error('Torrent error:', err);
          });
          
          torrent.on('warning', (err) => {
            console.warn('Torrent warning:', err);
          });

          // Add more detailed event handlers
          torrent.on('wire', (wire: any) => {
            console.log('Connected to peer:', wire.remoteAddress);
            
            // Monitor wire connection
            wire.on('close', () => {
              console.log('Wire connection closed:', wire.remoteAddress);
            });

            wire.on('error', (err: Error) => {
              console.error('Wire connection error:', err);
            });

            wire.on('timeout', () => {
              console.warn('Wire connection timeout:', wire.remoteAddress);
            });
          });

          // Add reconnection logic
          torrent.on('noPeers', (announceType: string) => {
            console.log('No peers found:', announceType);
            // Attempt to reconnect after a delay
            setTimeout(() => {
              if (webTorrentClient && torrent) {
                console.log('Attempting to reconnect...');
                // Remove and re-add the torrent to force a new connection attempt
                webTorrentClient.remove(torrent.infoHash, {}, (err) => {
                  if (err) {
                    console.error('Error removing torrent:', err);
                    return;
                  }
                  // Re-add the torrent with fresh tracker connections
                  webTorrentClient.add(torrent.magnetURI, {
                    announce: TRACKERS,
                    path: './.torrents'
                  });
                });
              }
            }, 5000);

            resolve(streamInfo);
          });
        });
      } catch (error) {
        console.error('Error starting torrent stream:', error);
        reject(error);
      }
    });
  }

  /**
   * Get a specific file from a torrent by info hash and file path
   */
  public getFileFromTorrent(infoHash: string, filePath: string): Promise<{
    file: any;
    streamURL: string;
  }> {
    return new Promise((resolve, reject) => {
      if (!this.activeTorrents.has(infoHash)) {
        reject(new Error('Torrent not found'));
        return;
      }
      
      const streamInfo = this.activeTorrents.get(infoHash)!;
      
      if (!streamInfo.ready) {
        reject(new Error('Torrent not ready yet'));
        return;
      }
      
      const fileInfo = streamInfo.files.find(f => f.path === filePath);
      if (!fileInfo) {
        reject(new Error('File not found in torrent'));
        return;
      }
      
      const file = streamInfo.torrent!.files.find(f => f.path === filePath);
      if (!file) {
        reject(new Error('File not found in torrent'));
        return;
      }
      
      resolve({
        file,
        streamURL: fileInfo.streamURL!
      });
    });
  }

  /**
   * Get all active torrents
   */
  public getActiveTorrents(): TorrentStreamInfo[] {
    return Array.from(this.activeTorrents.values());
  }

  /**
   * Stop and remove a torrent
   */
  public removeTorrent(infoHash: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!webTorrentClient) {
        reject(new Error('WebTorrent client is not available'));
        return;
      }
      
      if (!this.activeTorrents.has(infoHash)) {
        resolve();
        return;
      }
      
      const streamInfo = this.activeTorrents.get(infoHash)!;
      
      if (streamInfo.torrent) {
        webTorrentClient.remove(infoHash, {}, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          this.activeTorrents.delete(infoHash);
          resolve();
        });
      } else {
        this.activeTorrents.delete(infoHash);
        resolve();
      }
    });
  }

  /**
   * Determine the file type based on file extension
   */
  private getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    
    if (videoExtensions.includes(extension)) return 'video';
    if (audioExtensions.includes(extension)) return 'audio';
    if (imageExtensions.includes(extension)) return 'image';
    if (documentExtensions.includes(extension)) return 'document';
    
    return 'other';
  }

  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'mkv': 'video/x-matroska',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'webm': 'video/webm',
      'm4v': 'video/x-m4v',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
      'm4a': 'audio/mp4',
      'aac': 'audio/aac',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'rtf': 'application/rtf',
      'odt': 'application/vnd.oasis.opendocument.text'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  private setupFallbackBlobUrl(file: any, fileInfo: any) {
    try {
      const chunks: ArrayBuffer[] = [];
      const stream = file.createReadStream();
      
      stream.on('data', (chunk: ArrayBuffer) => {
        chunks.push(chunk);
      });
      
      stream.on('end', () => {
        try {
          const blob = new Blob(chunks, { type: this.getMimeType(fileInfo.name) });
          fileInfo.streamURL = URL.createObjectURL(blob);
          console.log('Created fallback blob URL for:', fileInfo.name);
        } catch (err) {
          console.error('Error creating blob URL:', err);
        }
      });

      stream.on('error', (err: Error) => {
        console.error('Error reading file stream:', err);
      });
    } catch (err) {
      console.error('Error setting up fallback blob URL:', err);
    }
  }

  public static getInstance(): TorrentService {
    if (!TorrentService.instance) {
      TorrentService.instance = new TorrentService();
    }
    return TorrentService.instance;
  }

  private activeTorrents: Map<string, TorrentStreamInfo> = new Map();

  async processTorrentToVideo(torrentFile: File, options: VideoProcessingOptions): Promise<{ infoHash: string; playbackId: string; info: any }> {
    try {
      // Create a new File object from the torrent file
      const videoFile = new File([torrentFile], torrentFile.name, { type: torrentFile.type });
      
      // Create video asset with Livepeer
      const asset = await this.livepeer.createVideoAsset(videoFile, options);
      
      // Get basic torrent info
      const torrentInfo = {
        title: torrentFile.name,
        size: torrentFile.size,
        category: this.detectCategory(torrentFile.name),
        description: '',
        infoHash: '', // This will be set by the torrent service
        magnetURI: '',
        files: [{
          name: torrentFile.name,
          size: torrentFile.size,
          type: this.getFileType(torrentFile.name),
          path: torrentFile.name
        }]
      };
      
      return {
        infoHash: torrentInfo.infoHash,
        playbackId: asset.playbackId,
        info: {
          ...torrentInfo,
          asset
        }
      };
    } catch (error) {
      console.error('Error processing torrent to video:', error);
      throw error;
    }
  }

  async processTorrentFile(file: File): Promise<{
    infoHash: string;
    playbackId: string;
    info: TorrentInfo;
  }> {
    try {
      // Read the torrent file
      const buffer = await file.arrayBuffer();
      const torrentBuffer = Buffer.from(buffer);
      
      // Parse the torrent file
      const parsed = parseTorrent(torrentBuffer) as ParsedTorrent;
      if (!parsed) {
        throw new Error('Failed to parse torrent file');
      }

      console.log('Parsed torrent file:', parsed);

      // Create torrent info
      const info: TorrentInfo = {
        infoHash: parsed.infoHash,
        title: typeof parsed.name === 'string' ? parsed.name : file.name,
        size: parsed.length || 0,
        description: parsed.comment,
        files: (parsed.files || []).map(file => ({
          name: file.name,
          size: file.length,
          path: file.path
        })),
        category: this.detectCategory(parsed.name || file.name)
      };

      // Only start downloading if we're on the client side
      if (this.isClient) {
        // Start downloading the torrent in the background
        this.startTorrentFromFile(file).catch(error => {
          console.error('Error starting torrent from file:', error);
        });
      }
      
      // Process with Livepeer for streaming
      const asset = await this.livepeer.processTorrentToVideo(
        info.infoHash, 
        {
          title: info.title,
          description: info.description || '',
          staticMp4: false,
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
        }
      );
      
      return {
        infoHash: info.infoHash,
        playbackId: asset.playbackId,
        info,
      };
    } catch (error) {
      console.error('Error processing torrent file:', error);
      throw error;
    }
  }

  private async startTorrentFromFile(file: File): Promise<TorrentStreamInfo> {
    if (!this.isClient) {
      throw new Error('WebTorrent can only be used in the browser');
    }

    if (!webTorrentClient) {
      throw new Error('WebTorrent client is not initialized');
    }

    try {
      const buffer = await file.arrayBuffer();
      const torrentBuffer = Buffer.from(buffer);
      const parsed = parseTorrent(torrentBuffer) as ParsedTorrent;
      
      // Check if we're already downloading this torrent
      if (this.activeTorrents.has(parsed.infoHash)) {
        return this.activeTorrents.get(parsed.infoHash)!;
      }

      // Create magnet URI manually with all available trackers
      const magnetUri = `magnet:?xt=urn:btih:${parsed.infoHash}` +
        (parsed.name ? `&dn=${encodeURIComponent(parsed.name)}` : '') +
        (parsed.length ? `&xl=${parsed.length}` : '') +
        [...(parsed.announce || []), ...TRACKERS].map(tr => `&tr=${encodeURIComponent(tr)}`).join('');

      // Initialize stream info
      const streamInfo: TorrentStreamInfo = {
        infoHash: parsed.infoHash,
        magnetURI: magnetUri,
        files: [],
        progress: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        numPeers: 0,
        ready: false
      };

      this.activeTorrents.set(parsed.infoHash, streamInfo);

      return new Promise((resolve, reject) => {
        // Add timeout for torrent addition
        const timeout = setTimeout(() => {
          reject(new Error('Timeout while adding torrent'));
        }, 30000);

        webTorrentClient!.add(torrentBuffer, {
          announce: TRACKERS,
          path: './.torrents',
          // Add more options for better connection handling
          maxConns: 55,
          uploadRateLimit: 0,
          downloadRateLimit: 0,
          connectionTimeout: 10000,
          retries: 5,
          retryInterval: 5000
        }, (torrent) => {
          clearTimeout(timeout);
          console.log('Torrent added from file:', torrent.name);
          console.log('Info hash:', torrent.infoHash);
          
          // Update stream info with torrent data
          streamInfo.torrent = torrent;
          streamInfo.files = torrent.files.map(file => ({
            name: file.name,
            path: file.path,
            size: file.length,
            type: this.getFileType(file.name),
            streamURL: URL.createObjectURL(new Blob([], { type: this.getMimeType(file.name) }))
          }));
          
          // Set up streaming URLs for each file
          streamInfo.files.forEach((fileInfo, index) => {
            const file = torrent.files[index];
            console.log('Setting up streaming for file:', fileInfo.name);
            
            // Create a MediaSource for video/audio files
            if (['video', 'audio'].includes(fileInfo.type)) {
              try {
                const mediaSource = new MediaSource();
                const videoUrl = URL.createObjectURL(mediaSource);
                fileInfo.streamURL = videoUrl;
                
                let sourceBuffer: SourceBuffer | null = null;
                let queue: ArrayBuffer[] = [];
                let isPlaying = false;
                
                mediaSource.addEventListener('sourceopen', () => {
                  try {
                    sourceBuffer = mediaSource.addSourceBuffer(this.getMimeType(fileInfo.name));
                    
                    sourceBuffer.addEventListener('updateend', () => {
                      if (!sourceBuffer?.updating && queue.length > 0) {
                        sourceBuffer?.appendBuffer(queue.shift()!);
                      } else if (!sourceBuffer?.updating && mediaSource.readyState === 'open') {
                        mediaSource.endOfStream();
                      }
                    });
                    
                    // Stream the file to the source buffer
                    file.createReadStream().on('data', (chunk) => {
                      if (!sourceBuffer?.updating) {
                        sourceBuffer?.appendBuffer(chunk);
                      } else {
                        queue.push(chunk);
                      }
                    });
                    
                    // Handle stream end
                    file.createReadStream().on('end', () => {
                      if (queue.length === 0 && !sourceBuffer?.updating) {
                        mediaSource.endOfStream();
                      }
                    });
                    
                    console.log('MediaSource setup complete for:', fileInfo.name);
                  } catch (err) {
                    console.error('Error setting up source buffer:', err);
                    // Fallback to blob URL if source buffer setup fails
                    this.setupFallbackBlobUrl(file, fileInfo);
                  }
                });
                
                // Handle MediaSource errors
                mediaSource.addEventListener('error', (err) => {
                  console.error('MediaSource error:', err);
                  this.setupFallbackBlobUrl(file, fileInfo);
                });
                
                console.log('MediaSource created for:', fileInfo.name);
              } catch (err) {
                console.error('Error creating MediaSource:', err);
                this.setupFallbackBlobUrl(file, fileInfo);
              }
            } else {
              // For non-media files, use regular blob URL
              this.setupFallbackBlobUrl(file, fileInfo);
            }
          });
          
          streamInfo.ready = true;
          
          // Set up event listeners
          torrent.on('download', () => {
            streamInfo.progress = torrent.progress;
            streamInfo.downloadSpeed = torrent.downloadSpeed;
            streamInfo.uploadSpeed = torrent.uploadSpeed;
            streamInfo.numPeers = torrent.numPeers;
            console.log(
              'Progress:', Math.round(torrent.progress * 100) + '%',
              'Download speed:', (torrent.downloadSpeed / 1024 / 1024).toFixed(2) + 'MB/s',
              'Upload speed:', (torrent.uploadSpeed / 1024 / 1024).toFixed(2) + 'MB/s',
              'Peers:', torrent.numPeers
            );
          });
          
          torrent.on('done', () => {
            console.log('Torrent download finished:', torrent.name);
            streamInfo.progress = 1;
          });
          
          torrent.on('error', (err) => {
            console.error('Torrent error:', err);
          });
          
          torrent.on('warning', (err) => {
            console.warn('Torrent warning:', err);
          });

          // Add more detailed event handlers
          torrent.on('wire', (wire: any) => {
            console.log('Connected to peer:', wire.remoteAddress);
            
            // Monitor wire connection
            wire.on('close', () => {
              console.log('Wire connection closed:', wire.remoteAddress);
            });

            wire.on('error', (err: Error) => {
              console.error('Wire connection error:', err);
            });

            wire.on('timeout', () => {
              console.warn('Wire connection timeout:', wire.remoteAddress);
            });
          });

          // Add reconnection logic
          torrent.on('noPeers', (announceType: string) => {
            console.log('No peers found:', announceType);
            // Attempt to reconnect after a delay
            setTimeout(() => {
              if (webTorrentClient && torrent) {
                console.log('Attempting to reconnect...');
                // Remove and re-add the torrent to force a new connection attempt
                webTorrentClient.remove(torrent.infoHash, {}, (err) => {
                  if (err) {
                    console.error('Error removing torrent:', err);
                    return;
                  }
                  // Re-add the torrent with fresh tracker connections
                  webTorrentClient.add(torrent.magnetURI, {
                    announce: TRACKERS,
                    path: './.torrents'
                  });
                });
              }
            }, 5000);

            resolve(streamInfo);
          });
        });
      });
    } catch (error) {
      console.error('Error starting torrent from file:', error);
      throw error;
    }
  }
}