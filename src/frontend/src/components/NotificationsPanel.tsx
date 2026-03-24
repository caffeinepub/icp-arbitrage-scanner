import { AlertCircle, Bell } from "lucide-react";
import type { ArbitrageRow } from "../lib/arbitrage";

interface Props {
  rows: ArbitrageRow[];
}

export function NotificationsPanel({ rows }: Props) {
  const alerts = rows.slice(0, 10);
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan" />
          Alerts
        </h2>
        {alerts.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/20 text-danger">
            {alerts.length} LIVE
          </span>
        )}
      </div>
      <div className="space-y-2">
        {alerts.map((row, i) => (
          <div
            key={row.symbol}
            className="rounded-lg p-3 border border-border bg-secondary/30"
            data-ocid={`notifications.item.${i + 1}`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-success-bright shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {row.symbol} — {row.spreadPct.toFixed(2)}% spread
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Buy on {row.buyOn}, sell on {row.sellOn}
                </p>
              </div>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No significant alerts right now
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
