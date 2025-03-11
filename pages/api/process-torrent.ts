import { NextApiRequest, NextApiResponse } from 'next';
import { TorrentService } from '../../services/torrent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { magnetUri } = req.body;

    if (!magnetUri) {
      return res.status(400).json({ error: 'Magnet URI is required' });
    }

    const torrentService = TorrentService.getInstance();
    const result = await torrentService.processTorrent(magnetUri);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error processing torrent:', error);
    return res.status(500).json({ error: 'Failed to process torrent' });
  }
}