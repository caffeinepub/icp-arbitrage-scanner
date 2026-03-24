import { TrendingUp, X } from "lucide-react";
import { type ArbitrageRow, formatPrice } from "../lib/arbitrage";

interface Props {
  rows: ArbitrageRow[];
}

export function TopPairsPanel({ rows }: Props) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan" />
          Top Pairs
        </h2>
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={row.symbol}
            className={`rounded-lg p-3 border ${
              i < 3
                ? "border-success-bright/40 bg-success/5"
                : "border-border bg-secondary/30"
            }`}
            data-ocid={`toppairs.item.${i + 1}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-foreground">
                {row.symbol}
              </span>
              <span
                className={`text-sm font-bold mono ${
                  row.spreadPct > 2 ? "text-success-bright" : "text-success"
                }`}
              >
                {row.spreadPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {row.buyOn} → {row.sellOn}
              </span>
              <span className="text-[10px] text-muted-foreground mono">
                Δ {formatPrice(row.profitPer)}
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No pairs available
          </p>
        )}
      </div>
    </div>
  );
}
