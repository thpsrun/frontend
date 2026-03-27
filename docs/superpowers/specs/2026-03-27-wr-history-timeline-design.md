# WR History Timeline — Design Spec

**Date:** 2026-03-27
**Feature:** World Record history step chart for leaderboard pages

## Overview

A toggleable step chart that visualizes the full world record progression for any game category or individual level. Appears above the leaderboard table when the user clicks "WR History Graph". Uses the `/api/v1/history` endpoint and renders via Recharts.

## API Endpoint

**Full Game:** `GET /api/v1/history/{gameSlug}/category/{categorySlug}?values={valueSlugs}`
**Individual Level:** `GET /api/v1/history/{gameSlug}/level/{levelSlug}/{categorySlug}?values={valueSlugs}`

### Response Shape

```typescript
interface WRHistoryPlayer {
    name: string
    nickname: string | null
}

interface WRHistoryEntry {
    run_id: string
    players: WRHistoryPlayer[]
    history_time: string           // "0m 22s"
    history_time_secs: number      // 22.0
    delta: number | null           // null for first, 0.0 for ties, negative for improvements
    video: string | null
    arch_video: string | null
    start_date: string             // ISO datetime — when this run became WR
    end_date: string | null        // ISO datetime — when beaten (null = current record)
}

interface WRHistoryResponse {
    game: string
    category: string
    subcategory: string
    level: string | null
    entries: WRHistoryEntry[]
}
```

## Behavior

### Toggle Flow

1. User clicks "WR History Graph" button (right-aligned in the variable toggles row)
2. Chart area expands above the leaderboard table (CSS `max-height` transition, ~300px)
3. `useWRHistory` hook fires, fetching data for current gameSlug/categorySlug/levelSlug/valueSlugs
4. Chart renders once data arrives
5. Clicking button again collapses the chart; component unmounts, no further API calls

### Category/Variable Switching

- When timeline is **open** and user changes category or variable values: chart shows a loading overlay (semi-transparent dark layer with centered "Loading Graph..." text), then renders new data once fetched. Uses Tanstack Query's `isFetching` flag to catch refetches.
- When timeline is **closed**: no API call is made on category/variable change. The hook is not mounted.

### Tied Records

Multiple entries can share the same `history_time_secs` (delta: 0.0). These are collapsed:

- Only the **first** entry at each unique time is shown as a point on the chart
- Subsequent ties are counted and displayed in the tooltip as a suffix: `"guished (+18 ties)"`
- The step line only reflects actual time improvements, not tied re-submissions

## Component Architecture

### New Files

| File | Purpose |
|------|---------|
| `frontend/src/types/api.ts` | Add `WRHistoryPlayer`, `WRHistoryEntry`, `WRHistoryResponse` types |
| `frontend/src/hooks/leaderboard/useWRHistory.ts` | React Query hook for `/api/v1/history` endpoint |
| `frontend/src/components/leaderboard/wr-history-chart.tsx` | Recharts step chart with tooltip, click handlers, loading overlay |

### Modified Files

| File | Change |
|------|--------|
| `frontend/src/components/game/game-overview.tsx` | Add `showHistory` state, toggle button in variable row, render `<WRHistoryChart>` above leaderboard |

### Data Flow

```
game-overview.tsx
├── [showHistory state: boolean, default false]
├── "WR History Graph" button (toggles showHistory)
└── {showHistory && <WRHistoryChart gameSlug categorySlug levelSlug? valueSlugs />}
      └── useWRHistory({ gameSlug, categorySlug, levelSlug?, valueSlugs })
            ├── enabled: always true (component only mounts when showHistory is true)
            ├── queryKey: ["wr-history", gameSlug, categorySlug, levelSlug, ...valueSlugs]
            └── staleTime: 60s, no refetchInterval
```

### `useWRHistory` Hook

- **Params:** `{ gameSlug: string, categorySlug: string, levelSlug?: string, valueSlugs: string[] }`
- **URL construction:** If `levelSlug` is present, uses IL endpoint pattern; otherwise FG pattern
- **Query key:** `["wr-history", gameSlug, categorySlug, levelSlug ?? null, ...valueSlugs]`
- **Stale time:** 60 seconds
- **No refetch interval** — WR history doesn't change frequently
- **Retry:** 2 attempts (match existing hook convention)

### `WRHistoryChart` Component

**Props:**
```typescript
interface WRHistoryChartProps {
    gameSlug: string
    categorySlug: string
    levelSlug?: string
    valueSlugs: string[]
}
```

**Data Processing (pre-render):**
1. Group consecutive entries by `history_time_secs`
2. Keep only the first entry per group (earliest `start_date`)
3. Count remaining entries in group as tie count
4. Map to chart data shape:
   ```typescript
   interface ChartDataPoint {
       date: number              // start_date as Unix timestamp (for XAxis)
       timeSecs: number          // history_time_secs (for YAxis)
       displayTime: string       // history_time ("0m 22s")
       playerLabel: string       // "Nami (+2 ties)" or "guished"
       video: string | null
       archVideo: string | null
       delta: number | null
       tieCount: number          // 0 if no ties
   }
   ```

**Recharts Configuration:**
- `<ResponsiveContainer width="100%" height={300}>`
- `<LineChart>` with processed data array
- `<Line type="stepAfter" dataKey="timeSecs">` — step-after gives flat-hold-then-drop
- `<XAxis dataKey="date">` — Unix timestamps, tick formatter shows years, domain from first entry to current date
- `<YAxis dataKey="timeSecs" reversed>` — fastest times at top, tick formatter converts seconds to time strings
- Custom `<Tooltip>` render prop:
  ```
  guished (+18 ties) // November 5, 2015
  0m 22s // Delta: -3s
  ```
  First entry omits the delta line.
- `<Dot>` with `onClick` — opens video URL in new tab
  - If `video` URL contains "twitch.tv", use `arch_video` instead (if available)
  - Otherwise use `video`
  - `cursor: pointer` on dots with videos

**Loading Overlay:**
- Positioned absolutely over the chart container
- Semi-transparent dark background
- Centered "Loading Graph..." text
- Shown when `isFetching` is true (catches both initial loads and refetches)

**Button Placement:**
- In `game-overview.tsx`, same flex row as `<VariableToggles>`
- Pushed right via `ml-auto`
- Uses existing `Button` component with a chart/timeline Lucide icon
- Text: "WR History Graph"

**Chart Sizing & Animation:**
- Fixed height: 300px
- Expand/collapse via CSS `max-height` transition on a wrapper div
- Chart area has bottom margin to separate from the leaderboard table

## Dependencies

**New package:** `recharts` (latest stable, ~45KB gzipped)

## Edge Cases

- **No entries:** If API returns empty `entries` array, show a message like "No WR history available" instead of an empty chart
- **Single entry:** Chart shows one point with a flat line extending to current date
- **19-way tie:** Only first runner shown as point; tooltip shows "+18 ties"
- **No video:** Dot is not clickable (no pointer cursor, no onClick behavior)
- **Twitch video detection:** Check if `video` URL includes "twitch.tv"; if so, use `arch_video` instead. If `arch_video` is also null, fall back to the Twitch `video` URL (a Twitch link is better than no link)
- **Player display name:** Use `nickname` if present, otherwise `name`. For multi-player entries, join with " & " (e.g., "Nami & George")
