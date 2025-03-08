import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

interface HeroProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

const Hero: React.FC<HeroProps> = ({ title, description, thumbnailUrl, videoUrl }) => {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push('/watch/1'); // Navigate to the watch page for the featured video
  };

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src={thumbnailUrl}
          alt={title}
          width={1920}
          height={1080}
          className="transform scale-105 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            {description}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={handlePlayClick}
              className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center"
            >
              <span className="mr-2">▶</span> Play Now
            </button>
            <button className="bg-gray-800 bg-opacity-50 text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-70 transition-all">
              More Info
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero; 