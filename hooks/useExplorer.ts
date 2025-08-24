import { useQuery } from "@tanstack/react-query";
import { useEthersProvider, useEthersSigner } from "@/hooks/useEthers";

import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { useNetworkConfig } from "./useNetworkConfig";
import { CONTRACT_ABI } from "@/lib/contract";

export const useExplorer = (setActiveTab: (tab: string) => void) => {
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const { chainId } = useAccount();
  const { CONTRACT_ADDRESS } = useNetworkConfig();
  const { address } = useAccount();
  const getRequests = useQuery({
    queryKey: ["userRequests", chainId, address, CONTRACT_ADDRESS],
    queryFn: async () => {
      setActiveTab("decrypt");
      try {
        if (!signer || !provider || !chainId) {
          return [];
        }

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        const requestIdCount = await contract.currentRequestId();
        const totalRequests =
          typeof requestIdCount === "number"
            ? requestIdCount
            : Number(requestIdCount);
        if (!Number.isFinite(totalRequests) || totalRequests <= 0) {
          return [];
        }
        const startId = Math.max(1, totalRequests - 19);
        console.log("Request ID: ", totalRequests);
        const temp = [];
        for (let i = startId; i <= totalRequests; i++) {
          console.log(i);
          const r = await contract.userRequests(i);
          if (r.requestedBy == address) {
            temp.push({
              id: i,
              requestedBy: r[0],
              encryptedAt: r[1],
              decryptedAt: r[2],
              message: r[4],
            });
          }
        }
        return temp;
      } catch (error) {
        console.error("Error fetching request:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 0, // 5 minutes
  });

  return getRequests;
};
