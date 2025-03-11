import React from "react";
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

interface PlayerProps {
  id: string;
}

const VideoPlayer: React.FC<PlayerProps> = ({ id }) => {
  // Construct the IPFS playback URL
  const ipfsUrl = `https://gateway.ipfs.io/ipfs/${id}`;
  
  return (
    <Plyr
      source={{
        type: 'video',
        sources: [
          {
            src: ipfsUrl,
            type: 'video/mp4',
          },
        ],
      }}
      options={{
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
        autoplay: false,
        ratio: '16:9',
      }}
    />
  );
};

export default VideoPlayer;
