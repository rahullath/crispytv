import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import VideoGrid from '../components/VideoGrid';

// Featured video with real Livepeer content
const featuredVideo = {
  title: "Succession",
  description: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
  thumbnailUrl: "/images/163840-3840x2160-desktop-4k-succession-tv-series-background-image.jpg",
  videoUrl: "https://lvpr.tv/?v=2082evpzexk5rbvx"
};

const trendingVideos = [
  {
    id: "1",
    title: "The Last of Us",
    thumbnailHash: "/images/3856356-3840x2160-desktop-hd-the-last-of-us-movie-wallpaper-photo.jpg",
    category: "Drama Series",
  },
  {
    id: "2",
    title: "House of the Dragon",
    thumbnailHash: "/images/housedragon.jpg",
    category: "Fantasy",
  },
  {
    id: "3",
    title: "The White Lotus",
    thumbnailHash: "/images/983682-3840x2160-desktop-4k-the-white-lotus-tv-series-background.jpg",
    category: "Drama Series",
  },
  {
    id: "4",
    title: "The Bear",
    thumbnailHash: "/images/thebear.jpeg",
    category: "Comedy Drama",
  }
];

const newReleases = [
  {
    id: "5",
    title: "True Detective: Night Country",
    thumbnailHash: "/images/1855298-1920x1080-desktop-full-hd-true-detective-tv-series-background-image.jpg",
    category: "Crime Drama",
  },
  {
    id: "6",
    title: "The Morning Show",
    thumbnailHash: "/images/1008678-3840x2160-desktop-4k-the-morning-show-tv-series-wallpaper.jpg",
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
