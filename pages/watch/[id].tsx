import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import VideoPlayer from '../../components/VideoPlayer';
import VideoGrid from '../../components/VideoGrid';

// Mock data - replace with actual data fetching
const mockVideo = {
  id: "1",
  title: "Succession",
  description: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company. Starring Brian Cox, Jeremy Strong, and Sarah Snook, this Emmy-winning series explores power, family, and betrayal in the world of global media.",
  playbackId: "2082evpzexk5rbvx",
  thumbnailUrl: "https://wallpapercat.com/w/full/7/e/d/163840-3840x2160-desktop-4k-succession-tv-series-background-image.jpg",
  category: "Drama Series",
  releaseYear: "2024",
  duration: "60 min",
  rating: "TV-MA"
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
  const { id } = router.query;

  // In a real app, fetch video data based on the ID
  const video = mockVideo;

  return (
    <Layout>
      <VideoPlayer
        playbackId={video.playbackId}
        title={video.title}
        description={video.description}
        thumbnailUrl={video.thumbnailUrl}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
          <span>{video.releaseYear}</span>
          <span>•</span>
          <span>{video.duration}</span>
          <span>•</span>
          <span>{video.rating}</span>
          <span>•</span>
          <span>{video.category}</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">{video.title}</h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-8">{video.description}</p>
        
        <div className="flex space-x-4 mb-12">
          <button className="bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-all">
            ▶ Play Now
          </button>
          <button className="bg-gray-800 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-700 transition-all">
            + Add to Watchlist
          </button>
        </div>
      </div>

      {/* More to Watch */}
      <div className="py-8 px-4">
        <VideoGrid
          title="More Like This"
          videos={relatedVideos}
        />
      </div>
    </Layout>
  );
};

export default WatchPage; 