# ICP Arbitrage Scanner

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Price arbitrage scanner across ICPSwap, KongSwap, and Neutrinite (NTN) DEXes
- Backend that fetches token prices via HTTP outcalls to public DEX APIs
- Display all tokens with prices on each DEX and the % price difference
- Highlight top arbitrage opportunities (rows with highest price diff)
- Filters: search by token, min diff %, exchange toggles
- Sort by price difference, profit opportunity, volume
- Auto-refresh / manual refresh
- Stats bar: total pairs scanned, last sync time, opportunities found

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: Use http-outcalls to query ICPSwap, KongSwap, and Neutrinite public APIs for token prices
2. Backend: Aggregate prices by token symbol, compute arbitrage spread
3. Backend: Return structured list of ArbitrageOpportunity records
4. Frontend: Dashboard with stats bar, filter/search panel, sortable data table
5. Frontend: Color-code rows by opportunity size, highlight top pairs
6. Frontend: Manual refresh + polling interval
