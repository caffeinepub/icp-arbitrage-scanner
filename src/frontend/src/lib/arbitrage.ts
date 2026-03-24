import type { TokenPrice } from "./mockData";

export interface ArbitrageRow {
  symbol: string;
  name: string;
  icpswap: number | null;
  kongswap: number | null;
  neutrinite: number | null;
  spreadPct: number;
  minPrice: number;
  maxPrice: number;
  buyOn: string;
  sellOn: string;
  profitPer: number;
  volume24h: number;
}

export type ExchangeName = "icpswap" | "kongswap" | "neutrinite";

export const EXCHANGE_LABELS: Record<ExchangeName, string> = {
  icpswap: "ICPSwap",
  kongswap: "KongSwap",
  neutrinite: "Neutrinite",
};

export function computeArbitrage(
  tokens: TokenPrice[],
  enabledExchanges: Set<ExchangeName>,
): ArbitrageRow[] {
  const rows: ArbitrageRow[] = [];

  for (const token of tokens) {
    const prices: Array<{ exchange: ExchangeName; price: number }> = [];
    if (enabledExchanges.has("icpswap") && token.icpswap != null) {
      prices.push({ exchange: "icpswap", price: token.icpswap });
    }
    if (enabledExchanges.has("kongswap") && token.kongswap != null) {
      prices.push({ exchange: "kongswap", price: token.kongswap });
    }
    if (enabledExchanges.has("neutrinite") && token.neutrinite != null) {
      prices.push({ exchange: "neutrinite", price: token.neutrinite });
    }

    if (prices.length < 2) continue;

    let minEntry = prices[0];
    let maxEntry = prices[0];
    for (const p of prices) {
      if (p.price < minEntry.price) minEntry = p;
      if (p.price > maxEntry.price) maxEntry = p;
    }

    const spreadPct =
      ((maxEntry.price - minEntry.price) / minEntry.price) * 100;
    rows.push({
      symbol: token.symbol,
      name: token.name,
      icpswap: token.icpswap,
      kongswap: token.kongswap,
      neutrinite: token.neutrinite,
      spreadPct,
      minPrice: minEntry.price,
      maxPrice: maxEntry.price,
      buyOn: EXCHANGE_LABELS[minEntry.exchange],
      sellOn: EXCHANGE_LABELS[maxEntry.exchange],
      profitPer: maxEntry.price - minEntry.price,
      volume24h: token.volume24h,
    });
  }

  return rows.sort((a, b) => b.spreadPct - a.spreadPct);
}

export function formatPrice(price: number | null): string {
  if (price === null) return "—";
  if (price >= 1000) return `$${price.toFixed(2)}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  if (price >= 0.01) return `$${price.toFixed(5)}`;
  return `$${price.toFixed(6)}`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}

export function parseICPSwap(json: string): TokenPrice[] {
  try {
    const data = JSON.parse(json);
    const arr = Array.isArray(data) ? data : (data?.data ?? data?.tokens ?? []);
    return arr
      .filter((t: any) => t?.symbol)
      .map((t: any) => ({
        symbol: t.symbol,
        name: t.name ?? t.symbol,
        icpswap: Number.parseFloat(t.priceUSD ?? t.price ?? "0") || null,
        kongswap: null,
        neutrinite: null,
        volume24h: Number.parseFloat(t.volumeUSD ?? t.volume ?? "0") || 0,
      }));
  } catch {
    return [];
  }
}

export function parseKongSwap(json: string): TokenPrice[] {
  try {
    const data = JSON.parse(json);
    const arr = Array.isArray(data) ? data : (data?.data ?? data?.tokens ?? []);
    return arr
      .filter((t: any) => t?.symbol)
      .map((t: any) => ({
        symbol: t.symbol,
        name: t.name ?? t.symbol,
        icpswap: null,
        kongswap: Number.parseFloat(t.price ?? t.priceUSD ?? "0") || null,
        neutrinite: null,
        volume24h: Number.parseFloat(t.volume_24h ?? t.volumeUSD ?? "0") || 0,
      }));
  } catch {
    return [];
  }
}

export function parseNeutrinite(json: string): TokenPrice[] {
  try {
    const data = JSON.parse(json);
    const arr = Array.isArray(data) ? data : (data?.data ?? data?.tokens ?? []);
    return arr
      .filter((t: any) => t?.symbol)
      .map((t: any) => ({
        symbol: t.symbol,
        name: t.name ?? t.symbol,
        icpswap: null,
        kongswap: null,
        neutrinite: Number.parseFloat(t.price ?? t.priceUSD ?? "0") || null,
        volume24h: Number.parseFloat(t.volume ?? t.volumeUSD ?? "0") || 0,
      }));
  } catch {
    return [];
  }
}

export function mergeTokenPrices(sources: TokenPrice[][]): TokenPrice[] {
  const map = new Map<string, TokenPrice>();
  for (const source of sources) {
    for (const t of source) {
      const existing = map.get(t.symbol);
      if (!existing) {
        map.set(t.symbol, { ...t });
      } else {
        if (t.icpswap != null) existing.icpswap = t.icpswap;
        if (t.kongswap != null) existing.kongswap = t.kongswap;
        if (t.neutrinite != null) existing.neutrinite = t.neutrinite;
        if (t.volume24h > existing.volume24h) existing.volume24h = t.volume24h;
      }
    }
  }
  return Array.from(map.values());
}
