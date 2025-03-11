import React from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

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
  // Construct the HLS playback URL
  const playbackUrl = `https://lp-playback.com/hls/${playbackId}/index.m3u8`;

  return (
    <div className="w-full bg-black relative">
      {/* Video Player */}
      <div className="relative aspect-video w-full">
        <Plyr
          source={{
            type: 'video',
            sources: [
              {
                src: playbackUrl,
                type: 'application/x-mpegURL',
              },
            ],
            poster: thumbnailUrl,
          }}
          options={{
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
            autoplay: false,
          }}
        />
      </div>

      {/* Video Info */}
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {description && <p className="text-gray-300 mb-4">{description}</p>}
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