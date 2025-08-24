"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  baseSepolia,
  filecoin,
  arbitrumSepolia,
  optimismSepolia,
  filecoinCalibration,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { http } from "wagmi";

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "Randamu",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [
    baseSepolia,
    arbitrumSepolia,
    optimismSepolia,
    {
      ...filecoinCalibration,
      iconUrl:
        "https://gateway.lighthouse.storage/ipfs/QmXQMtADMsCqsYEvyuEA3PkFq2xtWAQetQFtkybjEXvk3Z",
    },
    {
      ...filecoin,
      iconUrl:
        "https://gateway.lighthouse.storage/ipfs/QmXQMtADMsCqsYEvyuEA3PkFq2xtWAQetQFtkybjEXvk3Z",
    },
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
    [filecoin.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});

export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
