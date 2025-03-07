import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import VideoGrid from '../../components/VideoGrid';

// Mock data - replace with actual data fetching
const categories = {
  action: {
    name: "Action",
    description: "High-octane action movies and series",
    videos: [
      {
        id: "1",
        title: "Action Movie 1",
        thumbnailHash: "QmSampleHash1",
        category: "Action",
      },
      {
        id: "2",
        title: "Action Movie 2",
        thumbnailHash: "QmSampleHash2",
        category: "Action",
      },
      // Add more mock videos
    ],
  },
  drama: {
    name: "Drama",
    description: "Emotional and compelling dramas",
    videos: [
      {
        id: "3",
        title: "Drama Series 1",
        thumbnailHash: "QmSampleHash3",
        category: "Drama",
      },
      {
        id: "4",
        title: "Drama Series 2",
        thumbnailHash: "QmSampleHash4",
        category: "Drama",
      },
      // Add more mock videos
    ],
  },
  // Add more categories
};

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = router.query;

  // In a real app, fetch category data based on the category parameter
  // For now, we'll use mock data
  const categoryData = categories[category as keyof typeof categories] || {
    name: "Category Not Found",
    description: "This category doesn't exist.",
    videos: [],
  };

  return (
    <Layout>
      {/* Category Header */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black" />
        <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {categoryData.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              {categoryData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Category Videos */}
      <div className="py-8">
        <VideoGrid
          title={`All ${categoryData.name} Content`}
          videos={categoryData.videos}
        />
      </div>
    </Layout>
  );
};

export default CategoryPage; 