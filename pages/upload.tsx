import { NextPage } from 'next';
import Layout from '../components/Layout';
import TorrentUpload from '../components/TorrentUpload';

const UploadPage: NextPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
        <TorrentUpload />
      </div>
    </Layout>
  );
};

export default UploadPage; 