import React, { useState, useRef } from 'react';
import { LivepeerService } from '../services/livepeer';
import toast from 'react-hot-toast';

const TestUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [assetInfo, setAssetInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create loading toast
    const toastId = toast.loading('Starting upload...');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const livepeer = LivepeerService.getInstance();
      
      // Log file details
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const result = await livepeer.createVideoAsset(file, {
        title: file.name,
        description: 'Test upload',
      }, (progress) => {
        // Update progress from TUS upload
        setUploadProgress(Math.round(progress));
      });

      console.log('Upload result:', result);
      setAssetInfo(result);

      // Update toast to success
      toast.success('Upload complete!', { id: toastId });
      
      // Display playback URL
      if (result.playbackUrl) {
        console.log('Playback URL:', result.playbackUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Test File Upload</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Video File
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {assetInfo && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Upload Success</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Asset ID:</strong> {assetInfo.id}</p>
              <p><strong>Playback ID:</strong> {assetInfo.playbackId}</p>
              <p><strong>Status:</strong> {assetInfo.status}</p>
              {assetInfo.playbackUrl && (
                <div>
                  <p className="mb-2"><strong>Playback URL:</strong></p>
                  <a 
                    href={assetInfo.playbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {assetInfo.playbackUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUpload; 