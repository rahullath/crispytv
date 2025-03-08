import { LIVEPEER_KEY } from "../constants";

if (!LIVEPEER_KEY) {
  console.warn("Livepeer API key is not set. Please set NEXT_PUBLIC_LIVEPEER_KEY in your .env file.");
}

// Mock Livepeer client for development
const LivepeerClient = {
  createAsset: async (options: any) => {
    return {
      id: "2082eaf3-648d-4781-bd50-e99cc2c55e25",
      playbackId: "2082evpzexk5rbvx",
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: 180,
      name: options.name,
      input: {
        url: options.input,
      },
      output: {
        url: "https://vod-cdn.lp-playback.studio/raw/catalyst-vod-com/2082evpzexk5rbvx/video.mp4",
        playbackUrl: "https://vod-cdn.lp-playback.studio/hls/catalyst-vod-com/2082evpzexk5rbvx/index.m3u8",
      },
    };
  },
  
  getAsset: async (id: string) => {
    return {
      id: "2082eaf3-648d-4781-bd50-e99cc2c55e25",
      playbackId: "2082evpzexk5rbvx",
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: 180,
      name: 'Introduction to Web3 Development',
      input: {
        url: "https://vod-cdn.lp-playback.studio/raw/catalyst-vod-com/2082evpzexk5rbvx/video.mp4",
      },
      output: {
        url: "https://vod-cdn.lp-playback.studio/raw/catalyst-vod-com/2082evpzexk5rbvx/video.mp4",
        playbackUrl: "https://vod-cdn.lp-playback.studio/hls/catalyst-vod-com/2082evpzexk5rbvx/index.m3u8",
      },
    };
  },
  
  deleteAsset: async (id: string) => {
    console.log('Deleting asset:', id);
    return { success: true };
  },
};

export default LivepeerClient;
