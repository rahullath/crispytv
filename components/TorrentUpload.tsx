import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TorrentService } from '../services/torrent';
import toast from 'react-hot-toast';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  message: string;
}

const TorrentUpload: React.FC = () => {
  const router = useRouter();
  const [magnetUri, setMagnetUri] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    message: ''
  });
  const [webrtcStatus, setWebrtcStatus] = useState<{
    supported: boolean;
    error?: string;
  }>({ supported: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const torrentService = TorrentService.getInstance();
    const status = torrentService.isWebRTCSupported();
    setWebrtcStatus(status);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webrtcStatus.supported && !videoUrl) {
      toast.error('WebRTC is required for torrent streaming. Please enable it in your browser settings or use a direct video URL.');
      return;
    }
    
    if (!magnetUri.trim() && !videoUrl.trim() && (!fileInputRef.current?.files || fileInputRef.current.files.length === 0)) {
      toast.error('Please enter a magnet URI, video URL, or select a torrent file');
      return;
    }

    // Create a toast that we'll update with progress
    const toastId = toast.loading('Processing content...');
    let errorShown = false;

    try {
      setProcessing({
        isProcessing: true,
        progress: 0,
        message: 'Starting upload...'
      });

      const torrentService = TorrentService.getInstance();
      let result;

      if (videoUrl.trim()) {
        // Handle direct video URL
        setProcessing({
          isProcessing: true,
          progress: 10,
          message: 'Creating video asset from URL...'
        });

        try {
          // Set up progress update interval
          const progressInterval = setInterval(() => {
            setProcessing(prev => ({
              ...prev,
              progress: Math.min(prev.progress + 5, 95) // Increment by 5% up to 95%
            }));
          }, 3000);

          result = await torrentService.processTorrent(videoUrl);
          clearInterval(progressInterval);

          if (!result?.playbackId) {
            throw new Error('Failed to get playback ID');
          }

          setProcessing({
            isProcessing: true,
            progress: 100,
            message: 'Upload complete! Redirecting...'
          });

          // Update toast to success
          toast.success('Video processed successfully!', {
            id: toastId
          });
        } catch (error) {
          // Update toast to error
          const errorMessage = error instanceof Error ? error.message : 'Failed to process video';
          toast.error(errorMessage, {
            id: toastId
          });
          errorShown = true;
          throw error;
        }
      } else if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
        // Handle torrent file upload
        const file = fileInputRef.current.files[0];
        
        setProcessing({
          isProcessing: true,
          progress: 10,
          message: 'Processing torrent file...'
        });

        try {
          result = await torrentService.processTorrentFile(file);

          if (!result?.playbackId) {
            throw new Error('Failed to get playback ID');
          }

          setProcessing({
            isProcessing: true,
            progress: 100,
            message: 'Upload complete! Redirecting...'
          });

          // Update toast to success
          toast.success('Torrent processed successfully!', {
            id: toastId
          });
        } catch (error) {
          // Update toast to error
          const errorMessage = error instanceof Error ? error.message : 'Failed to process torrent file';
          toast.error(errorMessage, {
            id: toastId
          });
          errorShown = true;
          throw error;
        }
      } else {
        // Handle magnet URI
        setProcessing({
          isProcessing: true,
          progress: 10,
          message: 'Processing magnet URI...'
        });

        try {
          result = await torrentService.processTorrent(magnetUri);

          if (!result?.playbackId) {
            throw new Error('Failed to get playback ID');
          }

          setProcessing({
            isProcessing: true,
            progress: 100,
            message: 'Upload complete! Redirecting...'
          });

          // Update toast to success
          toast.success('Magnet URI processed successfully!', {
            id: toastId
          });
        } catch (error) {
          // Update toast to error
          const errorMessage = error instanceof Error ? error.message : 'Failed to process magnet URI';
          toast.error(errorMessage, {
            id: toastId
          });
          errorShown = true;
          throw error;
        }
      }

      if (result?.playbackId) {
        router.push(`/watch/${result.infoHash}?playbackId=${result.playbackId}`);
      } else {
        throw new Error('Failed to get playback ID');
      }
    } catch (error: any) {
      console.error('Error processing content:', error);
      
      // Only show error toast if not already shown
      if (!errorShown) {
        toast.error(error?.message || 'Failed to process content. Please try again.', {
          id: toastId
        });
      }

      setProcessing({
        isProcessing: false,
        progress: 0,
        message: ''
      });
    }
  };

  const handleFileChange = () => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      // Clear magnet URI and video URL when file is selected
      setMagnetUri('');
      setVideoUrl('');
    }
  };

  const handleMagnetUriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMagnetUri(e.target.value);
    setVideoUrl(''); // Clear video URL when magnet URI is entered
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
    setMagnetUri(''); // Clear magnet URI when video URL is entered
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Content</h2>
      
      {!webrtcStatus.supported && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-yellow-800">WebRTC Not Available</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            WebRTC is not available. You can still upload content using a direct video URL.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="url"
            id="videoUrl"
            value={videoUrl}
            onChange={handleVideoUrlChange}
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={Boolean(magnetUri) || (fileInputRef.current?.files && fileInputRef.current.files.length > 0)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <div>
          <label htmlFor="torrentFile" className="block text-sm font-medium text-gray-700 mb-2">
            Torrent File
          </label>
          <input
            type="file"
            id="torrentFile"
            ref={fileInputRef}
            accept=".torrent"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={!webrtcStatus.supported || Boolean(videoUrl)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <div>
          <label htmlFor="magnetUri" className="block text-sm font-medium text-gray-700 mb-2">
            Magnet URI
          </label>
          <input
            type="text"
            id="magnetUri"
            value={magnetUri}
            onChange={handleMagnetUriChange}
            placeholder="magnet:?xt=urn:btih:..."
            disabled={!webrtcStatus.supported || Boolean(videoUrl) || (fileInputRef.current?.files && fileInputRef.current.files.length > 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={processing.isProcessing}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            processing.isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {processing.isProcessing ? 'Processing...' : 'Upload Content'}
        </button>
      </form>

      {processing.isProcessing && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{processing.message}</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(processing.progress * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(processing.progress * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TorrentUpload;