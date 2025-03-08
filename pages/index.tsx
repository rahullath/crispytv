import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import VideoGrid from '../components/VideoGrid';

// Featured video with real Livepeer content
const featuredVideo = {
  title: "Succession",
  description: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
  thumbnailUrl: "https://placehold.co/1920x1080/333/ffffff?text=Succession",
  videoUrl: "https://lvpr.tv/?v=2082evpzexk5rbvx"
};

const trendingVideos = [
  {
    id: "1",
    title: "The Last of Us",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=The+Last+of+Us",
    category: "Drama Series",
  },
  {
    id: "2",
    title: "House of the Dragon",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=House+of+the+Dragon",
    category: "Fantasy",
  },
  {
    id: "3",
    title: "The White Lotus",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=The+White+Lotus",
    category: "Drama Series",
  },
  {
    id: "4",
    title: "The Bear",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=The+Bear",
    category: "Comedy Drama",
  }
];

const newReleases = [
  {
    id: "5",
    title: "True Detective: Night Country",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=True+Detective",
    category: "Crime Drama",
  },
  {
    id: "6",
    title: "The Morning Show",
    thumbnailHash: "https://placehold.co/640x360/333/ffffff?text=Morning+Show",
    category: "Drama",
  }
];

const Home: React.FC = () => {
  return (
    <Layout>
      <Hero
        title={featuredVideo.title}
        description={featuredVideo.description}
        thumbnailUrl={featuredVideo.thumbnailUrl}
        videoUrl={featuredVideo.videoUrl}
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
