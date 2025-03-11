import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { http } from "wagmi";
import type { AppProps } from "next/app";
import { ThemeProvider } from "../utils";
import { Toaster } from "react-hot-toast";

const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http("https://rpc-amoy.polygon.technology"),
  },
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#eab308",
          })}
          modalSize="compact"
        >
          <ThemeProvider>
            <Toaster />
            <Component {...pageProps} />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
