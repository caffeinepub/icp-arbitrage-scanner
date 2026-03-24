import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { type ArbitrageRow, formatPrice, formatVolume } from "../lib/arbitrage";

interface Props {
  rows: ArbitrageRow[];
  isLoading: boolean;
}

function TokenAvatar({ symbol }: { symbol: string }) {
  const colors = [
    "bg-blue-500/20 text-blue-400",
    "bg-purple-500/20 text-purple-400",
    "bg-yellow-500/20 text-yellow-400",
    "bg-green-500/20 text-green-400",
    "bg-red-500/20 text-red-400",
    "bg-pink-500/20 text-pink-400",
    "bg-indigo-500/20 text-indigo-400",
    "bg-orange-500/20 text-orange-400",
  ];
  const idx = symbol.charCodeAt(0) % colors.length;
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${colors[idx]}`}
    >
      {symbol.charAt(0)}
    </div>
  );
}

export function ArbitrageTable({ rows, isLoading }: Props) {
  if (isLoading) {
    return (
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="table.loading_state"
      >
        <div className="p-4 space-y-2">
          {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((k) => (
            <Skeleton key={k} className="h-10 w-full bg-muted/30 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-center"
        data-ocid="table.empty_state"
      >
        <TrendingUp className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
        <p className="text-muted-foreground text-sm">
          No arbitrage opportunities found
        </p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Try lowering the minimum spread filter
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden"
      data-ocid="arb.table"
    >
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {[
                "Token",
                "ICPSwap",
                "KongSwap",
                "Neutrinite",
                "Spread %",
                "Vol 24h",
                "Opportunity",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-[10px] uppercase tracking-widest font-semibold text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isHighlight = row.spreadPct > 1.0;
              return (
                <motion.tr
                  key={row.symbol}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.018, duration: 0.25 }}
                  className={`border-b border-border/40 transition-all hover:bg-muted/10 ${
                    isHighlight ? "glow-row" : ""
                  }`}
                  data-ocid={`arb.item.${i + 1}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <TokenAvatar symbol={row.symbol} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {row.symbol}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[90px]">
                          {row.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="mono text-xs text-foreground/90">
                      {formatPrice(row.icpswap)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="mono text-xs text-foreground/90">
                      {formatPrice(row.kongswap)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="mono text-xs text-foreground/90">
                      {formatPrice(row.neutrinite)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`mono text-sm font-bold ${
                        row.spreadPct > 2
                          ? "text-success-bright"
                          : row.spreadPct > 0.5
                            ? "text-success"
                            : "text-muted-foreground"
                      }`}
                    >
                      {row.spreadPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="mono text-xs text-muted-foreground">
                      {formatVolume(row.volume24h)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-cyan shrink-0" />
                        <span className="text-[11px] text-cyan font-medium">
                          BUY {row.buyOn}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-danger shrink-0" />
                        <span className="text-[11px] text-danger font-medium">
                          SELL {row.sellOn}
                        </span>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
