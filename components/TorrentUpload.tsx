import { useState } from 'react';
import { useRouter } from 'next/router';

interface ProcessingState {
  status: 'idle' | 'parsing' | 'processing' | 'complete' | 'error';
  message: string;
  info?: {
    title: string;
    category: string;
    size: number;
  };
}

export default function TorrentUpload() {
  const [magnetUri, setMagnetUri] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    message: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingState({
      status: 'parsing',
      message: 'Parsing torrent information...',
    });

    try {
      const response = await fetch('/api/process-torrent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ magnetUri }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process torrent');
      }

      const data = await response.json();
      
      setProcessingState({
        status: 'complete',
        message: 'Processing complete! Redirecting...',
        info: {
          title: data.info.title,
          category: data.info.category,
          size: data.info.size,
        },
      });

      // Redirect to the video page after a short delay
      setTimeout(() => {
        router.push(`/watch/${data.playbackId}`);
      }, 2000);
    } catch (err) {
      setProcessingState({
        status: 'error',
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Process Torrent</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="magnetUri" className="block text-sm font-medium text-gray-700">
            Magnet URI
          </label>
          <textarea
            id="magnetUri"
            value={magnetUri}
            onChange={(e) => setMagnetUri(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            placeholder="Enter magnet URI..."
            required
            disabled={processingState.status !== 'idle' && processingState.status !== 'error'}
          />
        </div>

        {processingState.status !== 'idle' && (
          <div className={`p-4 rounded-md ${
            processingState.status === 'error' 
              ? 'bg-red-50 text-red-700' 
              : processingState.status === 'complete'
              ? 'bg-green-50 text-green-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            <p className="text-sm font-medium">{processingState.message}</p>
            {processingState.info && (
              <div className="mt-2 text-sm">
                <p><strong>Title:</strong> {processingState.info.title}</p>
                <p><strong>Category:</strong> {processingState.info.category}</p>
                <p><strong>Size:</strong> {(processingState.info.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={processingState.status !== 'idle' && processingState.status !== 'error'}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            (processingState.status !== 'idle' && processingState.status !== 'error') 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          {processingState.status === 'parsing' ? 'Parsing...' :
           processingState.status === 'processing' ? 'Processing...' :
           processingState.status === 'complete' ? 'Complete!' :
           processingState.status === 'error' ? 'Try Again' :
           'Process Torrent'}
        </button>
      </form>
    </div>
  );
} 