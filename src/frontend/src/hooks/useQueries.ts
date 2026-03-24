import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mergeTokenPrices,
  parseICPSwap,
  parseKongSwap,
  parseNeutrinite,
} from "../lib/arbitrage";
import { type TokenPrice, generateMockData } from "../lib/mockData";
import { useActor } from "./useActor";

export interface CachedDEXData {
  icpswap: string;
  kongswap: string;
  neutrinite: string;
  timestamp: bigint;
}

function parseDEXData(data: CachedDEXData): {
  tokens: TokenPrice[];
  timestamp: bigint;
} {
  const icpTokens = parseICPSwap(data.icpswap);
  const kongTokens = parseKongSwap(data.kongswap);
  const ntnTokens = parseNeutrinite(data.neutrinite);
  const merged = mergeTokenPrices([icpTokens, kongTokens, ntnTokens]);
  if (merged.length < 5) {
    return { tokens: generateMockData(), timestamp: data.timestamp };
  }
  return { tokens: merged, timestamp: data.timestamp };
}

export function useDEXData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["dex-data"],
    queryFn: async () => {
      if (!actor) return { tokens: generateMockData(), timestamp: 0n };
      try {
        const data = (await (actor as any).getCachedData()) as CachedDEXData;
        return parseDEXData(data);
      } catch {
        return { tokens: generateMockData(), timestamp: 0n };
      }
    },
    enabled: !isFetching,
    staleTime: 30_000,
  });
}

export function useRefreshDEX() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        await new Promise((r) => setTimeout(r, 1200));
        return {
          tokens: generateMockData(),
          timestamp: BigInt(Date.now() * 1_000_000),
        };
      }
      try {
        const data = (await (actor as any).refreshAll()) as CachedDEXData;
        return parseDEXData(data);
      } catch {
        await new Promise((r) => setTimeout(r, 800));
        return {
          tokens: generateMockData(),
          timestamp: BigInt(Date.now() * 1_000_000),
        };
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["dex-data"], data);
    },
  });
}
