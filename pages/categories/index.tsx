import React from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { motion } from 'framer-motion';

// Mock data - replace with actual data fetching
const categories = [
  {
    id: 'action',
    name: 'Action',
    description: 'High-octane action movies and series',
    thumbnailHash: 'QmSampleHash1',
    videoCount: 150,
  },
  {
    id: 'drama',
    name: 'Drama',
    description: 'Emotional and compelling dramas',
    thumbnailHash: 'QmSampleHash2',
    videoCount: 120,
  },
  {
    id: 'comedy',
    name: 'Comedy',
    description: 'Laugh-out-loud comedies',
    thumbnailHash: 'QmSampleHash3',
    videoCount: 100,
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    description: 'Mind-bending science fiction',
    thumbnailHash: 'QmSampleHash4',
    videoCount: 80,
  },
  // Add more categories
];

const CategoriesPage: React.FC = () => {
  return (
    <Layout>
      {/* Header */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black" />
        <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Browse Categories
            </h1>
            <p className="text-lg md:text-xl text-gray-200">
              Discover content from various genres and categories
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/categories/${category.id}`}>
                <div className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {category.name}
                    </h2>
                    <p className="text-gray-300 text-sm mb-2">
                      {category.description}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {category.videoCount} videos
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage; 