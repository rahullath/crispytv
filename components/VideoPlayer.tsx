import React from 'react';
import { Player } from '@livepeer/react';
import { motion } from 'framer-motion';

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
    <div className="w-full bg-black">
      {/* Video Player */}
      <div className="relative aspect-video w-full">
        <Player
          playbackId={playbackId}
          autoPlay
          loop
          showPipButton
          objectFit="cover"
          poster={thumbnailUrl}
          className="w-full h-full"
        />
      </div>

      {/* Video Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        {description && (
          <p className="text-gray-300 mb-6">{description}</p>
        )}
        
        {/* Video Controls */}
        <div className="flex items-center space-x-4">
          <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all">
            Add to List
          </button>
          <button className="bg-gray-800 text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-70 transition-all">
            Share
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoPlayer; 