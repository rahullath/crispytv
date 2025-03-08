import React from 'react';

interface VideoPlayerProps {
  playbackId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackId,
  title,
  description,
  thumbnailUrl,
}) => {
  return (
    <div className="w-full bg-black relative">
      {/* Video Player */}
      <div className="relative aspect-video w-full">
        <iframe
          className="w-full h-full"
          src={`https://lvpr.tv/?v=${playbackId}`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Video Info */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all">
            Add to List
          </button>
          <button className="bg-gray-800 text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-70 transition-all">
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 