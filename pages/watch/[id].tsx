import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import VideoPlayer from '../../components/VideoPlayer';
import VideoGrid from '../../components/VideoGrid';

// Mock data - replace with actual data fetching
const mockVideo = {
  id: "1",
  title: "Sample Video Title",
  description: "This is a sample video description that provides more details about the content.",
  playbackId: "sample-playback-id",
  thumbnailUrl: "https://ipfs.io/ipfs/QmSampleHash",
  category: "Action",
};

const relatedVideos = [
  {
    id: "2",
    title: "Related Video 1",
    thumbnailHash: "QmSampleHash1",
    category: "Action",
  },
  {
    id: "3",
    title: "Related Video 2",
    thumbnailHash: "QmSampleHash2",
    category: "Action",
  },
  // Add more mock videos as needed
];

const WatchPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // In a real app, fetch video data based on the ID
  // For now, we'll use mock data
  const video = mockVideo;

  return (
    <Layout>
      <VideoPlayer
        playbackId={video.playbackId}
        title={video.title}
        description={video.description}
        thumbnailUrl={video.thumbnailUrl}
      />
      
      {/* Related Videos */}
      <div className="py-8">
        <VideoGrid
          title="More Like This"
          videos={relatedVideos}
        />
      </div>
    </Layout>
  );
};

export default WatchPage; 