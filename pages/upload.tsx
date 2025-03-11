import React from 'react';
import Layout from '../components/Layout';
import TorrentUpload from '../components/TorrentUpload';
import { Toaster } from 'react-hot-toast';

const UploadPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upload Your Content
            </h1>
            <p className="text-lg text-gray-600">
              Share your content by providing a magnet link. We'll process it and make it available for streaming.
            </p>
          </div>

          <TorrentUpload />
          
          <div className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How it works</h2>
            <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">1. Paste your magnet link</h3>
                <p className="mt-2 text-gray-600">
                  Copy the magnet link from your torrent client and paste it into the form above.
                </p>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">2. Processing</h3>
                <p className="mt-2 text-gray-600">
                  We'll process your content and prepare it for streaming using Livepeer's decentralized network.
                </p>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">3. Start streaming</h3>
                <p className="mt-2 text-gray-600">
                  Once processing is complete, you'll be redirected to the watch page where you can start streaming immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </Layout>
  );
};

export default UploadPage; 