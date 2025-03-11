import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import VideoPlayer from '../../components/VideoPlayer';
import VideoGrid from '../../components/VideoGrid';
import { TorrentService } from '../../services/torrent';
import toast from 'react-hot-toast';

interface TorrentFile {
  name: string;
  path: string;
  size: number;
  type: string;
  streamURL?: string;
}

interface StreamInfo {
  infoHash: string;
  magnetURI: string;
  files: TorrentFile[];
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  ready: boolean;
  torrent?: any;
}

// Mock data for regular videos
const mockVideo = {
  id: "1",
  title: "Mononoke",
  description: "Princess Mononoke (2024)",
  playbackId: "fca4i19ya5a70uh2",
  thumbnailUrl: "https://wallpapercat.com/w/full/7/e/d/163840-3840x2160-desktop-4k-succession-tv-series-background-image.jpg",
  category: "Anime",
  releaseYear: "2024",
  duration: "133 min",
  rating: "PG-13"
};

const relatedVideos = [
  {
    id: "2",
    title: "The Last of Us",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=The+Last+of+Us",
    category: "Drama Series",
  },
  {
    id: "3",
    title: "House of the Dragon",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=House+of+the+Dragon",
    category: "Fantasy",
  },
  {
    id: "4",
    title: "The White Lotus",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=The+White+Lotus",
    category: "Drama Series",
  }
];

const WatchPage: React.FC = () => {
  const router = useRouter();
  const { id, playbackId } = router.query;
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<TorrentFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTorrent, setIsTorrent] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !id) return;

    // Check if this is a torrent or regular video
    const checkTorrent = async () => {
      try {
        const torrentService = TorrentService.getInstance();
        const activeTorrents = torrentService.getActiveTorrents();
        const torrent = activeTorrents.find(t => t.infoHash === id);

        if (torrent) {
          setIsTorrent(true);
          initTorrent();
        } else {
          setIsTorrent(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking torrent:', err);
        setIsTorrent(false);
        setLoading(false);
      }
    };

    checkTorrent();
  }, [id]);

  const initTorrent = async () => {
    if (!id || typeof id !== 'string') return;

    const torrentService = TorrentService.getInstance();
    let isActive = true;
    let retryTimeout: NodeJS.Timeout;

    try {
      setLoading(true);
      setError(null);

      const activeTorrents = torrentService.getActiveTorrents();
      let streamInfo = activeTorrents.find(t => t.infoHash === id);

      if (!streamInfo) {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          retryTimeout = setTimeout(initTorrent, 2000);
          return;
        }
        setError('Torrent not found. Please re-upload the torrent.');
        setLoading(false);
        return;
      }

      if (isActive) {
        setStreamInfo(streamInfo);
        
        const videoFiles = streamInfo.files.filter(f => f.type === 'video');
        if (videoFiles.length > 0) {
          setSelectedFile(videoFiles[0]);
        } else {
          setSelectedFile(streamInfo.files[0]);
        }
        
        setLoading(false);
      }

      const intervalId = setInterval(() => {
        if (isActive) {
          const updatedTorrents = torrentService.getActiveTorrents();
          const updatedInfo = updatedTorrents.find(t => t.infoHash === id);
          if (updatedInfo) {
            setStreamInfo(updatedInfo);
          }
        }
      }, 1000);

      return () => {
        clearInterval(intervalId);
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }
      };
    } catch (err) {
      if (isActive) {
        console.error('Error initializing torrent:', err);
        toast.error('Failed to initialize torrent streaming');
        setError('Failed to initialize torrent streaming');
        setLoading(false);
      }
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number) => {
    return `${formatBytes(bytesPerSec)}/s`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isTorrent) {
    return (
      <Layout>
        <div className="flex flex-col min-h-screen bg-gray-100 p-4">
          <div className="w-full max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {selectedFile?.type === 'video' ? (
                <video 
                  ref={videoRef}
                  className="w-full h-auto max-h-[70vh]" 
                  controls 
                  autoPlay
                  playsInline
                >
                  <source src={selectedFile?.streamURL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : selectedFile?.type === 'audio' ? (
                <div className="p-8 bg-gray-800 flex items-center justify-center">
                  <audio 
                    className="w-full" 
                    controls 
                    autoPlay
                    src={selectedFile?.streamURL}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : selectedFile?.type === 'image' ? (
                <div className="p-8 bg-gray-800 flex items-center justify-center">
                  <img 
                    src={selectedFile?.streamURL} 
                    alt={selectedFile?.name} 
                    className="max-h-[70vh] object-contain"
                  />
                </div>
              ) : (
                <div className="p-8 bg-gray-800 text-white flex items-center justify-center">
                  <p>Preview not available for this file type. <a href={selectedFile?.streamURL} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Download file</a></p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-2">{streamInfo?.files[0]?.name || 'Untitled'}</h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>Info Hash: {streamInfo?.infoHash.substring(0, 8)}...</span>
                  <span>•</span>
                  <span>Peers: {streamInfo?.numPeers || 0}</span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Download Progress: {Math.round((streamInfo?.progress || 0) * 100)}%</span>
                    <span className="text-sm font-medium">
                      ↓ {formatSpeed(streamInfo?.downloadSpeed || 0)} | 
                      ↑ {formatSpeed(streamInfo?.uploadSpeed || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.round((streamInfo?.progress || 0) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {playbackId && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Livepeer Playback</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      This content is also available through Livepeer streaming.
                    </p>
                    <a 
                      href={`https://lvpr.tv?v=${playbackId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Watch on Livepeer
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Files</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {streamInfo?.files.map((file, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedFile(file)}
                      className={`p-3 rounded-lg cursor-pointer ${
                        selectedFile?.path === file.path 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          {file.type === 'video' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                              <path d="M14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                            </svg>
                          )}
                          {file.type === 'audio' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          )}
                          {file.type === 'image' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {file.type === 'document' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                          {file.type === 'other' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2H4v-1h16v1h-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Regular video playback
  if (!isTorrent) {
    return (
      <Layout>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <div className="w-full max-w-7xl mx-auto p-4">
            {/* Video Player Section */}
            <div className="mb-8 aspect-video">
              <iframe
                src={`https://lvpr.tv?v=${mockVideo.playbackId}`}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-presentation"
                className="w-full h-full rounded-lg"
              />
            </div>

            {/* Video Details Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{mockVideo.title}</h1>
                  <p className="text-gray-600 mb-4">{mockVideo.description}</p>
                  <p className="text-sm text-gray-500">{mockVideo.category} • {mockVideo.releaseYear} • {mockVideo.duration} • {mockVideo.rating}</p>
                </div>
              </div>
            </div>

            {/* Related Videos Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Related Videos</h2>
              <VideoGrid 
                title="Related Videos"
                videos={relatedVideos} 
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
};

export default WatchPage; 