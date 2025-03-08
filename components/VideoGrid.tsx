import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Video {
  id: string;
  title: string;
  thumbnailHash: string;
  category: string;
}

interface VideoGridProps {
  title: string;
  videos: Video[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ title, videos }) => {
  return (
    <div className="py-8 px-4 md:px-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-pointer"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={video.thumbnailHash}
                alt={video.title}
                width={640}
                height={360}
                className="transition-transform duration-300 group-hover:scale-110 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="font-semibold text-sm truncate">{video.title}</h3>
              <p className="text-xs text-gray-300">{video.category}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid; 