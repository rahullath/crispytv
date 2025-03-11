import React from 'react';
import Layout from '../components/Layout';
import TestUpload from '../components/TestUpload';

const TestUploadPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-12">
        <TestUpload />
      </div>
    </Layout>
  );
};

export default TestUploadPage; 