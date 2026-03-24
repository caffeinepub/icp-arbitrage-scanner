export interface TokenPrice {
  symbol: string;
  name: string;
  icpswap: number | null;
  kongswap: number | null;
  neutrinite: number | null;
  volume24h: number;
}

function vary(base: number, pct: number): number {
  return base * (1 + ((Math.random() * 2 - 1) * pct) / 100);
}

export function generateMockData(): TokenPrice[] {
  const tokens = [
    { symbol: "ICP", name: "Internet Computer", base: 8.42, vol: 2_100_000 },
    { symbol: "ckBTC", name: "Chain-key Bitcoin", base: 67_450, vol: 890_000 },
    { symbol: "ckETH", name: "Chain-key Ethereum", base: 3_285, vol: 540_000 },
    { symbol: "ckUSDC", name: "Chain-key USDC", base: 1.0002, vol: 1_200_000 },
    { symbol: "SNS1", name: "SNS-1 Token", base: 0.48, vol: 85_000 },
    { symbol: "GHOST", name: "Ghost", base: 0.000024, vol: 12_000 },
    { symbol: "CHAT", name: "OpenChat", base: 0.036, vol: 68_000 },
    { symbol: "HOT", name: "Hot or Not", base: 0.0089, vol: 45_000 },
    { symbol: "KINIC", name: "KINIC", base: 0.054, vol: 28_000 },
    { symbol: "WTN", name: "Waterfall", base: 0.72, vol: 92_000 },
    { symbol: "NTN", name: "Neutrinite", base: 0.31, vol: 55_000 },
    { symbol: "SONIC", name: "Sonic DEX", base: 0.0041, vol: 22_000 },
    { symbol: "PANDA", name: "IC Panda", base: 0.0068, vol: 31_000 },
    { symbol: "BOOM", name: "BoomDAO", base: 0.0022, vol: 18_000 },
    { symbol: "GLDGov", name: "Gold DAO", base: 0.58, vol: 74_000 },
    { symbol: "EXE", name: "EXE Token", base: 0.000087, vol: 9_500 },
    { symbol: "PARTY", name: "Party Token", base: 0.00019, vol: 7_200 },
    { symbol: "OGY", name: "Origyn", base: 0.012, vol: 41_000 },
    { symbol: "ICL", name: "ICLighthouse", base: 0.027, vol: 33_000 },
    { symbol: "MOD", name: "Modclub", base: 0.0051, vol: 19_000 },
    { symbol: "NFIDW", name: "NFID Wallet", base: 0.092, vol: 47_000 },
    { symbol: "ICX", name: "ICX Token", base: 0.0034, vol: 14_000 },
    { symbol: "ELNA", name: "ELNA AI", base: 0.018, vol: 26_000 },
    { symbol: "DOGMI", name: "Dogmi", base: 0.0000042, vol: 8_100 },
    { symbol: "KONG", name: "KongSwap", base: 0.14, vol: 62_000 },
  ];

  const spreadRanges = [
    2.5, 1.8, 1.2, 0.9, 2.1, 3.2, 0.5, 1.4, 0.7, 2.8, 1.6, 0.4, 2.3, 1.1, 0.8,
    3.5, 2.0, 0.6, 1.3, 0.9, 2.2, 1.7, 0.3, 3.1, 1.9,
  ];

  return tokens.map((t, i) => {
    const spread = spreadRanges[i] ?? 1.0;
    const icpswapPrice = vary(t.base, spread * 0.6);
    const kongPrice = vary(t.base, spread * 0.8);
    const ntnPrice = vary(t.base, spread * 0.4);

    const missing = Math.random() < 0.1;
    const missingIdx = missing ? Math.floor(Math.random() * 3) : -1;

    return {
      symbol: t.symbol,
      name: t.name,
      icpswap: missingIdx === 0 ? null : icpswapPrice,
      kongswap: missingIdx === 1 ? null : kongPrice,
      neutrinite: missingIdx === 2 ? null : ntnPrice,
      volume24h: t.vol * vary(1, 15),
    };
  });
}
