import { NextApiRequest, NextApiResponse } from 'next';
import { TorrentService } from '../../../services/torrent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { infoHash } = req.query;

  if (!infoHash || typeof infoHash !== 'string') {
    return res.status(400).json({ error: 'Info hash is required' });
  }

  const torrentService = TorrentService.getInstance();
  const activeTorrents = torrentService.getActiveTorrents();
  const torrent = activeTorrents.find(t => t.infoHash === infoHash);

  if (!torrent) {
    return res.status(404).json({ error: 'Torrent not found' });
  }

  return res.status(200).json(torrent);
}
