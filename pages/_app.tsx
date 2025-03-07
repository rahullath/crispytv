import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { LivepeerConfig } from "@livepeer/react";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { ThemeProvider } from "../utils";
import { Toaster } from "react-hot-toast";
import { LivepeerClient } from "../clients";

const FilecoinCalibrationTestnet = {
  id: 314159,
  name: "Filecoin - Calibration testnet",
  network: "filecoin",
  nativeCurrency: { name: "Calibration Filecoin", symbol: "tFIL", decimals: 18 },
  rpcUrls: {
    public: "https://api.calibration.node.glif.io/rpc/v1",
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  //@ts-ignore
  [FilecoinCalibrationTestnet ],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://api.calibration.node.glif.io/rpc/v1`,
      }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Ourtube",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#eab308",
        })}
        modalSize="compact"
        chains={chains}
      >
        <ThemeProvider>
          <LivepeerConfig client={LivepeerClient}>
            <Component {...pageProps} />
            <Toaster />
          </LivepeerConfig>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
