import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import VideoGrid from '../components/VideoGrid';

// Mock data - replace with actual data from your backend
const featuredVideo = {
  title: "Featured Video Title",
  description: "This is a sample featured video description that showcases the content and entices users to watch.",
  thumbnailUrl: "https://ipfs.io/ipfs/QmSampleHash",
};

const trendingVideos = [
  {
    id: "1",
    title: "Trending Video 1",
    thumbnailHash: "QmSampleHash1",
    category: "Action",
  },
  {
    id: "2",
    title: "Trending Video 2",
    thumbnailHash: "QmSampleHash2",
    category: "Drama",
  },
  // Add more mock videos as needed
];

const newReleases = [
  {
    id: "3",
    title: "New Release 1",
    thumbnailHash: "QmSampleHash3",
    category: "Comedy",
  },
  {
    id: "4",
    title: "New Release 2",
    thumbnailHash: "QmSampleHash4",
    category: "Sci-Fi",
  },
  // Add more mock videos as needed
];

const Home: React.FC = () => {
  return (
    <Layout>
      <Hero
        title={featuredVideo.title}
        description={featuredVideo.description}
        thumbnailUrl={featuredVideo.thumbnailUrl}
      />
      
      <VideoGrid
        title="Trending Now"
        videos={trendingVideos}
      />
      
      <VideoGrid
        title="New Releases"
        videos={newReleases}
      />
    </Layout>
  );
};

export default Home;
