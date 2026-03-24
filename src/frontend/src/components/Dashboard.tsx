import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Bell,
  LogOut,
  RefreshCw,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDEXData, useRefreshDEX } from "../hooks/useQueries";
import {
  EXCHANGE_LABELS,
  type ExchangeName,
  computeArbitrage,
} from "../lib/arbitrage";
import { ArbitrageTable } from "./ArbitrageTable";
import { NotificationsPanel } from "./NotificationsPanel";
import { TopPairsPanel } from "./TopPairsPanel";

type SortKey = "spread" | "profit" | "volume";
type RightPanel = "toppairs" | "notifications" | null;

export default function Dashboard() {
  const { data, isLoading } = useDEXData();
  const refresh = useRefreshDEX();

  const [search, setSearch] = useState("");
  const [minSpread, setMinSpread] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>("spread");
  const [enabledExchanges, setEnabledExchanges] = useState<Set<ExchangeName>>(
    new Set(["icpswap", "kongswap", "neutrinite"]),
  );
  const [rightPanel, setRightPanel] = useState<RightPanel>("toppairs");

  const tokens = data?.tokens ?? [];
  const timestamp = data?.timestamp ?? 0n;

  const lastSync = useMemo(() => {
    if (!timestamp || timestamp === 0n) return "Never";
    const ms = Number(timestamp) / 1e6;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return "Never";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [timestamp]);

  const arbitrageRows = useMemo(() => {
    return computeArbitrage(tokens, enabledExchanges);
  }, [tokens, enabledExchanges]);

  const filteredRows = useMemo(() => {
    let rows = arbitrageRows.filter((r) => r.spreadPct >= minSpread);
    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.symbol.toLowerCase().includes(s) ||
          r.name.toLowerCase().includes(s),
      );
    }
    if (sortBy === "profit")
      rows = [...rows].sort((a, b) => b.profitPer - a.profitPer);
    else if (sortBy === "volume")
      rows = [...rows].sort((a, b) => b.volume24h - a.volume24h);
    return rows;
  }, [arbitrageRows, minSpread, search, sortBy]);

  const opportunities = arbitrageRows.filter((r) => r.spreadPct > 0.5).length;

  function toggleExchange(ex: ExchangeName) {
    setEnabledExchanges((prev) => {
      const next = new Set(prev);
      if (next.has(ex)) {
        if (next.size > 2) next.delete(ex);
        else toast.error("At least 2 exchanges must be enabled");
      } else {
        next.add(ex);
      }
      return next;
    });
  }

  async function handleRefresh() {
    try {
      await refresh.mutateAsync();
      toast.success("Data refreshed successfully");
    } catch {
      toast.error("Refresh failed — using cached data");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 rounded-lg glow-cyan-btn flex items-center justify-center text-[#070D14] font-black text-lg select-none">
              K
            </div>
            <span className="font-bold text-lg tracking-widest text-foreground">
              KRYPTON
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 flex-1">
            {["Dashboard", "Scan", "Market", "News", "API"].map((link) => (
              <button
                type="button"
                key={link}
                className={`text-[13px] font-medium pb-1 transition-colors ${
                  link === "Dashboard"
                    ? "nav-active"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`nav.${link.toLowerCase()}.link`}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="pill-btn flex items-center gap-1.5"
              data-ocid="nav.wallet.button"
            >
              <Wallet className="w-3.5 h-3.5" /> Wallet
            </button>
            <button
              type="button"
              className="pill-btn flex items-center gap-1.5"
              data-ocid="nav.account.button"
            >
              <User className="w-3.5 h-3.5" /> Account
            </button>
            <button
              type="button"
              className="pill-btn flex items-center gap-1.5"
              data-ocid="nav.logout.button"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] mx-auto w-full px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">
            ICP Arbitrage Dashboard
          </h1>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Pairs Scanned",
                value: arbitrageRows.length,
                icon: Activity,
              },
              { label: "Last Sync", value: lastSync, icon: RefreshCw },
              {
                label: "Total Profit Opps",
                value: opportunities,
                icon: TrendingUp,
              },
            ].map(({ label, value, icon: Icon }, i) => (
              <div
                key={label}
                className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
                data-ocid={`stats.item.${i + 1}`}
              >
                <Icon className="w-4 h-4 text-cyan shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {label}
                  </p>
                  <p className="text-lg font-bold text-foreground mono">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-3 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            {/* Filters panel */}
            <div className="bg-card border border-border rounded-xl p-4 mb-3">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  Filters
                </span>
                <div className="flex items-center gap-1.5">
                  {(Object.keys(EXCHANGE_LABELS) as ExchangeName[]).map(
                    (ex) => (
                      <button
                        type="button"
                        key={ex}
                        onClick={() => toggleExchange(ex)}
                        className={`exchange-chip ${
                          enabledExchanges.has(ex) ? "active" : "inactive"
                        }`}
                        data-ocid={`filter.${ex}.toggle`}
                      >
                        {EXCHANGE_LABELS[ex]}
                      </button>
                    ),
                  )}
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <label
                    htmlFor="min-spread-input"
                    className="text-[11px] text-muted-foreground whitespace-nowrap"
                  >
                    Min Spread %
                  </label>
                  <input
                    id="min-spread-input"
                    type="number"
                    min={0}
                    step={0.1}
                    value={minSpread}
                    onChange={(e) =>
                      setMinSpread(Number.parseFloat(e.target.value) || 0)
                    }
                    className="w-16 bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground mono"
                    data-ocid="filter.min_spread.input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search token symbol or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-secondary border-border text-sm h-8"
                  data-ocid="filter.search.input"
                />
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortKey)}
                >
                  <SelectTrigger
                    className="w-36 h-8 bg-secondary border-border text-sm"
                    data-ocid="filter.sort.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="spread">Spread %</SelectItem>
                    <SelectItem value="profit">Profit</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refresh.isPending}
                  className="glow-cyan-btn flex items-center gap-2 px-4 py-1.5 rounded-lg text-[#070D14] font-bold text-sm transition-all disabled:opacity-70"
                  data-ocid="filter.refresh.button"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      refresh.isPending ? "animate-spin" : ""
                    }`}
                  />
                  {refresh.isPending ? "Refreshing..." : "Live Refresh"}
                </button>
              </div>
            </div>

            <ArbitrageTable rows={filteredRows} isLoading={isLoading} />
          </motion.div>

          {/* Right vertical tab pills */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setRightPanel((p) => (p === "toppairs" ? null : "toppairs"))
              }
              className={`vertical-pill px-3 py-5 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all ${
                rightPanel === "toppairs"
                  ? "bg-card border border-border text-cyan"
                  : "bg-card/50 border border-border/40 text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="panel.toppairs.toggle"
            >
              Top Pairs
            </button>
            <button
              type="button"
              onClick={() =>
                setRightPanel((p) =>
                  p === "notifications" ? null : "notifications",
                )
              }
              className={`vertical-pill px-3 py-5 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all ${
                rightPanel === "notifications"
                  ? "bg-card border border-border text-cyan"
                  : "bg-card/50 border border-border/40 text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="panel.notifications.toggle"
            >
              Alerts
            </button>
          </div>
        </div>

        <AnimatePresence>
          {rightPanel && (
            <motion.div
              key={rightPanel}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25 }}
              className="fixed top-16 right-0 w-72 h-[calc(100vh-4rem)] bg-card border-l border-border shadow-2xl z-30 overflow-y-auto scrollbar-thin"
              data-ocid={`${rightPanel}.panel`}
            >
              {rightPanel === "toppairs" && (
                <TopPairsPanel rows={arbitrageRows.slice(0, 8)} />
              )}
              {rightPanel === "notifications" && (
                <NotificationsPanel
                  rows={arbitrageRows.filter((r) => r.spreadPct > 1.5)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/40 mt-auto">
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-4">
            {["Home", "Scanner", "Support", "Legal"].map((l) => (
              <span
                key={l}
                className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {l}
              </span>
            ))}
          </nav>
          <p className="text-[11px] text-muted-foreground text-center">
            Data sourced from ICPSwap, KongSwap &amp; Neutrinite — not financial
            advice.
          </p>
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-cyan hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
