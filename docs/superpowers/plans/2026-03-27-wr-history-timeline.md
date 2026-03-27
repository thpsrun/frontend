# WR History Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggleable step chart above the leaderboard table that visualizes world record progression for any game category or individual level.

**Architecture:** A `WRHistoryChart` component renders a Recharts step chart, driven by a `useWRHistory` React Query hook that fetches from `/api/v1/history`. The chart is toggled via a "WR History Graph" button placed in the variable controls area of both `GameOverview` (full-game) and `ILDetail` (individual levels). When closed, no API calls are made.

**Tech Stack:** Recharts (step chart), Tanstack Query v5 (data fetching with `keepPreviousData`), React 19, TypeScript, TailwindCSS

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/package.json` | Modify | Add `recharts` dependency |
| `frontend/src/types/api.ts` | Modify | Add `WRHistoryPlayer`, `WRHistoryEntry`, `WRHistoryResponse` types |
| `frontend/src/hooks/leaderboard/useWRHistory.ts` | Create | React Query hook for `/api/v1/history` endpoint |
| `frontend/src/components/leaderboard/wr-history-chart.tsx` | Create | Recharts step chart, tooltip, click-to-video, loading overlay |
| `frontend/src/components/game/game-overview.tsx` | Modify | Add toggle state, button, chart slot for full-game view |
| `frontend/src/components/ils/il-detail.tsx` | Modify | Add toggle state, button, chart slot for IL view |

---

### Task 1: Install Recharts

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install recharts**

```bash
cd frontend && npm install recharts
```

- [ ] **Step 2: Verify build still passes**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "deps: add recharts for WR history timeline chart"
```

---

### Task 2: Add WR History API types

**Files:**
- Modify: `frontend/src/types/api.ts` (append after line 345, after `NavbarResponse`)

- [ ] **Step 1: Add types to api.ts**

Append the following after the `NavbarResponse` interface (after the closing `}` on line 345):

```typescript
// WR History (from /api/v1/history/{game}/category/{cat} or /level/{lvl}/{cat})
export interface WRHistoryPlayer {
    name: string
    nickname: string | null
}

export interface WRHistoryEntry {
    run_id: string
    players: WRHistoryPlayer[]
    history_time: string
    history_time_secs: number
    delta: number | null
    video: string | null
    arch_video: string | null
    start_date: string
    end_date: string | null
}

export interface WRHistoryResponse {
    game: string
    category: string
    subcategory: string
    level: string | null
    entries: WRHistoryEntry[]
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types/api.ts
git commit -m "feat: add WRHistory API types for history endpoint"
```

---

### Task 3: Create useWRHistory hook

**Files:**
- Create: `frontend/src/hooks/leaderboard/useWRHistory.ts`

- [ ] **Step 1: Create the hook file**

Create `frontend/src/hooks/leaderboard/useWRHistory.ts` with the following content:

```typescript
import {
    useQuery,
    keepPreviousData,
} from "@tanstack/react-query"
import type { UseQueryOptions } from "@tanstack/react-query"

import type { WRHistoryResponse } from "@/types/api"
import { API_BASE_URL } from "@/constants"

export interface UseWRHistoryParams {
    gameSlug: string
    categorySlug: string
    levelSlug?: string
    valueSlugs: string[]
}

type QueryOptions = Omit<
    UseQueryOptions<WRHistoryResponse, Error>,
    "queryKey" | "queryFn"
>

const fetchWRHistory = async ({
    gameSlug,
    categorySlug,
    levelSlug,
    valueSlugs,
}: UseWRHistoryParams): Promise<WRHistoryResponse> => {
    if (!gameSlug) {
        throw new Error("gameSlug required")
    }
    if (!categorySlug) {
        throw new Error("categorySlug required")
    }

    const qs = new URLSearchParams()
    if (valueSlugs.length > 0) {
        qs.set("values", valueSlugs.join(","))
    }

    // IL: /history/{game}/level/{level}/{cat}
    // FG: /history/{game}/category/{cat}
    const pathSegment = levelSlug
        ? `/level/${encodeURIComponent(levelSlug)}`
            + `/${encodeURIComponent(categorySlug)}`
        : `/category/${encodeURIComponent(categorySlug)}`

    const url = `${API_BASE_URL}/history`
        + `/${encodeURIComponent(gameSlug)}`
        + pathSegment
        + `?${qs.toString()}`

    const res = await fetch(url, {
        headers: { "Accept": "application/json" },
    })

    if (!res.ok) {
        throw new Error(
            `Failed WR history (${res.status})`,
        )
    }

    return res.json()
}

export const useWRHistory = (
    params: UseWRHistoryParams,
    options?: QueryOptions,
) => {
    const enabled = !!params.gameSlug
        && !!params.categorySlug
        && (options?.enabled ?? true)

    return useQuery<WRHistoryResponse, Error>({
        queryKey: [
            "wr-history",
            params.gameSlug,
            params.categorySlug,
            params.levelSlug ?? null,
            ...params.valueSlugs,
        ],
        queryFn: () => fetchWRHistory(params),
        staleTime: 60 * 1000,
        retry: 2,
        placeholderData: keepPreviousData,
        ...options,
        enabled,
    })
}
```

**Key differences from `useLeaderboard.ts`:**
- No `refetchInterval` — WR history doesn't change often
- Uses `keepPreviousData` so old chart stays visible (dimmed) during category switches
- Query key includes `levelSlug ?? null` to distinguish FG from IL queries
- URL construction branches on `levelSlug` presence

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/leaderboard/useWRHistory.ts
git commit -m "feat: add useWRHistory hook for WR history endpoint"
```

---

### Task 4: Create WRHistoryChart component

**Files:**
- Create: `frontend/src/components/leaderboard/wr-history-chart.tsx`

This is the largest task. The component handles: data processing (tie collapsing), Recharts rendering, custom tooltip, click-to-video, and loading overlay.

- [ ] **Step 1: Create the chart component file**

Create `frontend/src/components/leaderboard/wr-history-chart.tsx` with the following content:

```typescript
import { useMemo } from "react"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"

import { cn } from "@/lib/utils"
import { formatLongDate } from "@/lib/leaderboard-helpers"
import { useWRHistory } from "@/hooks/leaderboard/useWRHistory"

import type { WRHistoryEntry } from "@/types/api"


// ---- Types ----

interface WRHistoryChartProps {
    gameSlug: string
    categorySlug: string
    levelSlug?: string
    valueSlugs: string[]
}

interface ChartDataPoint {
    date: number
    startDate: string
    timeSecs: number
    displayTime: string
    playerLabel: string
    video: string | null
    archVideo: string | null
    delta: number | null
    tieCount: number
    isSynthetic: boolean
}


// ---- Formatting helpers ----

const formatTimeSecs = (secs: number): string => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    const parts: string[] = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0 || parts.length === 0) {
        const sStr = s % 1 === 0
            ? s.toFixed(0)
            : String(s)
        parts.push(`${sStr}s`)
    }
    return parts.join(" ")
}

const formatDelta = (delta: number): string => {
    const formatted = delta % 1 === 0
        ? delta.toFixed(0)
        : String(delta)
    return `${formatted}s`
}

/**
 * Get the best video URL for a record.
 * Prefers arch_video when the primary video is from Twitch,
 * since Twitch VODs expire. Falls back to primary video.
 */
const getVideoUrl = (
    video: string | null,
    archVideo: string | null,
): string | null => {
    if (video?.includes("twitch.tv") && archVideo) {
        return archVideo
    }
    return video ?? archVideo
}


// ---- Data processing ----

/**
 * Collapse tied WR entries into single chart points.
 * Groups consecutive entries with the same time; keeps
 * only the first entry per group (the runner who first
 * achieved that time). Appends a synthetic point at
 * the current date to extend the step line.
 */
const processEntries = (
    entries: WRHistoryEntry[],
): ChartDataPoint[] => {
    const points: ChartDataPoint[] = []
    let i = 0

    while (i < entries.length) {
        const entry = entries[i]
        const currentTime = entry.history_time_secs

        // Count consecutive tied entries
        let tieCount = 0
        let j = i + 1
        while (
            j < entries.length
            && entries[j].history_time_secs === currentTime
        ) {
            tieCount++
            j++
        }

        // Build player display name:
        // nickname preferred, joined with " & " for co-op
        const playerName = entry.players
            .map((p) => p.nickname ?? p.name)
            .join(" & ")
        const playerLabel = tieCount > 0
            ? `${playerName} (+${tieCount}`
                + ` ${tieCount === 1 ? "tie" : "ties"})`
            : playerName

        points.push({
            date: new Date(entry.start_date).getTime(),
            startDate: entry.start_date,
            timeSecs: entry.history_time_secs,
            displayTime: entry.history_time,
            playerLabel,
            video: entry.video,
            archVideo: entry.arch_video,
            delta: entry.delta,
            tieCount,
            isSynthetic: false,
        })

        i = j
    }

    // Extend the step line to the current date
    if (points.length > 0) {
        const last = points[points.length - 1]
        points.push({
            date: Date.now(),
            startDate: new Date().toISOString(),
            timeSecs: last.timeSecs,
            displayTime: last.displayTime,
            playerLabel: "",
            video: null,
            archVideo: null,
            delta: null,
            tieCount: 0,
            isSynthetic: true,
        })
    }

    return points
}


// ---- Sub-components ----

const CustomDot = (props: {
    cx?: number
    cy?: number
    payload?: ChartDataPoint
}) => {
    const { cx, cy, payload } = props
    if (
        !cx || !cy || !payload
        || payload.isSynthetic
    ) {
        return null
    }

    const videoUrl = getVideoUrl(
        payload.video,
        payload.archVideo,
    )

    return (
        <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#22d3ee"
            stroke="#0a0a1a"
            strokeWidth={2}
            style={{
                cursor: videoUrl
                    ? "pointer"
                    : "default",
            }}
            onClick={() => {
                if (videoUrl) {
                    window.open(videoUrl, "_blank")
                }
            }}
        />
    )
}

const CustomActiveDot = (props: {
    cx?: number
    cy?: number
    payload?: ChartDataPoint
}) => {
    const { cx, cy, payload } = props
    if (
        !cx || !cy || !payload
        || payload.isSynthetic
    ) {
        return null
    }

    const videoUrl = getVideoUrl(
        payload.video,
        payload.archVideo,
    )

    return (
        <circle
            cx={cx}
            cy={cy}
            r={7}
            fill="#22d3ee"
            stroke="#22d3ee"
            strokeWidth={2}
            fillOpacity={0.6}
            style={{
                cursor: videoUrl
                    ? "pointer"
                    : "default",
            }}
            onClick={() => {
                if (videoUrl) {
                    window.open(videoUrl, "_blank")
                }
            }}
        />
    )
}

interface TooltipProps {
    active?: boolean
    payload?: Array<{ payload: ChartDataPoint }>
}

const CustomTooltip = ({
    active,
    payload,
}: TooltipProps) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    if (data.isSynthetic) return null

    return (
        <div className={cn(
            "bg-background/95 border border-border",
            "rounded-md px-3 py-2 shadow-lg text-sm",
        )}>
            <div className="font-medium">
                {data.playerLabel}
                {" // "}
                {formatLongDate(data.startDate)}
            </div>
            <div className="text-muted-foreground">
                {data.displayTime}
                {data.delta != null && (
                    <> {" // Delta: "}
                        {formatDelta(data.delta)}
                    </>
                )}
            </div>
        </div>
    )
}


// ---- Main component ----

export const WRHistoryChart = ({
    gameSlug,
    categorySlug,
    levelSlug,
    valueSlugs,
}: WRHistoryChartProps) => {
    const {
        data,
        isFetching,
    } = useWRHistory({
        gameSlug,
        categorySlug,
        levelSlug,
        valueSlugs,
    })

    const chartData = useMemo(
        () => processEntries(data?.entries ?? []),
        [data],
    )

    // Compute year tick positions for clean X-axis labels
    const yearTicks = useMemo(() => {
        if (chartData.length === 0) return []
        const startYear = new Date(
            chartData[0].date,
        ).getFullYear()
        const endYear = new Date().getFullYear()
        const ticks: number[] = []
        for (let y = startYear; y <= endYear; y++) {
            ticks.push(
                new Date(y, 0, 1).getTime(),
            )
        }
        return ticks
    }, [chartData])

    const hasData = chartData.length > 1
    const noHistory = data
        && (data.entries?.length ?? 0) === 0

    return (
        <div className={cn(
            "relative border-b border-border/40",
            "px-4 py-4",
        )}>
            {/* Loading overlay */}
            {isFetching && (
                <div className={cn(
                    "absolute inset-0 z-10",
                    "bg-background/80",
                    "flex items-center justify-center",
                    "rounded-sm",
                )}>
                    <span className={cn(
                        "text-muted-foreground",
                        "text-sm",
                    )}>
                        Loading Graph...
                    </span>
                </div>
            )}

            {/* Empty state */}
            {noHistory && !isFetching && (
                <div className={cn(
                    "flex items-center justify-center",
                    "h-[300px]",
                )}>
                    <span className={cn(
                        "text-muted-foreground",
                        "text-sm",
                    )}>
                        No WR history available
                    </span>
                </div>
            )}

            {/* Chart */}
            {hasData && (
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
                    <LineChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            strokeOpacity={0.4}
                        />
                        <XAxis
                            dataKey="date"
                            type="number"
                            domain={[
                                "dataMin",
                                "dataMax",
                            ]}
                            ticks={yearTicks}
                            tickFormatter={(ts: number) =>
                                new Date(ts)
                                    .getFullYear()
                                    .toString()
                            }
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis
                            dataKey="timeSecs"
                            reversed
                            tickFormatter={formatTimeSecs}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            width={70}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                        />
                        <Line
                            type="stepAfter"
                            dataKey="timeSecs"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            dot={<CustomDot />}
                            activeDot={
                                <CustomActiveDot />
                            }
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
```

**Important implementation notes for the agent:**
- Use Context7 MCP to look up Recharts docs if any API is unclear (e.g., `type="stepAfter"`, custom dot/tooltip props, `ResponsiveContainer`)
- The `isSynthetic` point at the end extends the step line to "now" — it must be excluded from dots and tooltips
- `keepPreviousData` in the hook means `data` retains old values during refetch, so the chart stays visible under the loading overlay
- `isAnimationActive={false}` prevents awkward animation when data swaps between categories
- Tailwind classes `hsl(var(--border))` and `hsl(var(--muted-foreground))` ensure chart gridlines/axes match the site theme

- [ ] **Step 2: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds. The component is not yet rendered anywhere.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/leaderboard/wr-history-chart.tsx
git commit -m "feat: add WRHistoryChart component with step chart and tooltips"
```

---

### Task 5: Integrate chart into GameOverview (full-game)

**Files:**
- Modify: `frontend/src/components/game/game-overview.tsx`

Three changes: (1) import + state, (2) button in the controls header, (3) chart slot between header and leaderboard table.

- [ ] **Step 1: Add imports and state**

At the top of `game-overview.tsx`, add `useState` to the React import (line 1):

```typescript
import { useMemo, useEffect, useState } from "react"
```

Add the chart import after the existing component imports (after line 13):

```typescript
import { WRHistoryChart } from "@/components/leaderboard/wr-history-chart"
```

Add the Button and icon imports (after line 8, alongside other UI imports):

```typescript
import { Button } from "@/components/ui/button"
import { ChartLine } from "lucide-react"
```

Inside the `GameOverview` component, after `const hasLevels = ...` (line 108), add:

```typescript
    const [showHistory, setShowHistory] = useState(false)
```

- [ ] **Step 2: Add toggle button next to VariableToggles**

Replace the variable selectors block (lines 299-307) with a wrapper that includes the button:

**Current code (lines 299-307):**
```typescript
                        {/* Variable selectors */}
                        {activeCategory && (
                            <VariableToggles
                                variables={applicableVariables}
                                valueSlugs={valueSlugs}
                                onValueChange={handleValueChange}
                                dropdownThreshold={6}
                            />
                        )}
```

**Replace with:**
```typescript
                        {/* Variable selectors + WR History button */}
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                {activeCategory && (
                                    <VariableToggles
                                        variables={
                                            applicableVariables
                                        }
                                        valueSlugs={
                                            valueSlugs
                                        }
                                        onValueChange={
                                            handleValueChange
                                        }
                                        dropdownThreshold={6}
                                    />
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setShowHistory(
                                        (prev) => !prev,
                                    )
                                }
                                className="shrink-0 text-xs"
                            >
                                <ChartLine className="size-3.5" />
                                WR History Graph
                            </Button>
                        </div>
```

- [ ] **Step 3: Add chart slot between header and leaderboard table**

After the header `</div>` (line 308, the closing div of the `flex flex-col gap-3` container) and before the leaderboard `<div className="p-4">` (line 311), insert:

```typescript
                    {/* WR History chart */}
                    {showHistory && (
                        <WRHistoryChart
                            gameSlug={safeGameSlug}
                            categorySlug={categorySlug}
                            valueSlugs={valueSlugs}
                        />
                    )}
```

No `levelSlug` prop for full-game — the hook defaults to the FG endpoint when `levelSlug` is omitted.

- [ ] **Step 4: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Manual verification**

Start dev server (`npm run dev`). Navigate to a game leaderboard (e.g., `/thps1/any/console/rta`). Verify:
- "WR History Graph" button appears right-aligned in the controls row
- Clicking the button shows the chart above the leaderboard table
- Hovering data points shows the tooltip with player, date, time, and delta
- Clicking a dot opens the video in a new tab
- Switching categories while the chart is open shows the loading overlay, then new data
- Clicking the button again hides the chart

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/game/game-overview.tsx
git commit -m "feat: integrate WR History chart into full-game leaderboard view"
```

---

### Task 6: Integrate chart into ILDetail (individual levels)

**Files:**
- Modify: `frontend/src/components/ils/il-detail.tsx`

Same pattern as Task 5 but adapted for IL props structure.

- [ ] **Step 1: Add imports and state**

At the top of `il-detail.tsx`, add `useState` to the React import (line 1):

```typescript
import { useMemo, useEffect, useState } from "react"
```

Add the chart import after existing component imports (after line 14):

```typescript
import { WRHistoryChart } from "@/components/leaderboard/wr-history-chart"
```

Add the Button and icon imports alongside existing UI imports:

```typescript
import { Button } from "@/components/ui/button"
import { ChartLine } from "lucide-react"
```

Inside the `ILDetail` component, after `const runs = lbData?.runs ?? []` (line 192), add:

```typescript
    const [showHistory, setShowHistory] = useState(false)
```

- [ ] **Step 2: Add toggle button next to VariableToggles**

Replace the variable toggles block (lines 283-290) with a wrapper that includes the button:

**Current code (lines 283-290):**
```typescript
                {/* Variable toggles — buttons only, no dropdown fallback for ILs */}
                {activeCategory && (
                    <VariableToggles
                        variables={applicableVariables}
                        valueSlugs={valueSlugs}
                        onValueChange={handleValueChange}
                    />
                )}
```

**Replace with:**
```typescript
                {/* Variable toggles + WR History button */}
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        {activeCategory && (
                            <VariableToggles
                                variables={
                                    applicableVariables
                                }
                                valueSlugs={valueSlugs}
                                onValueChange={
                                    handleValueChange
                                }
                            />
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setShowHistory(
                                (prev) => !prev,
                            )
                        }
                        className="shrink-0 text-xs"
                    >
                        WR History Graph
                    </Button>
                </div>
```

- [ ] **Step 3: Add chart slot between header and leaderboard table**

After the header `</div>` (line 291, closing the `flex flex-col gap-3` container) and before the leaderboard `<div className="p-4">` (line 294), insert:

```typescript
            {/* WR History chart */}
            {showHistory && (
                <WRHistoryChart
                    gameSlug={gameSlug}
                    categorySlug={categorySlug}
                    levelSlug={levelSlug}
                    valueSlugs={valueSlugs}
                />
            )}
```

Note: `levelSlug` is passed here — this triggers the IL endpoint pattern in `useWRHistory`.

- [ ] **Step 4: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Manual verification**

Start dev server. Navigate to an IL leaderboard (e.g., `/thps1/ils/warehouse/agg/console/igt`). Verify same behavior as Task 5's manual checks, plus:
- Switching levels while chart is open shows loading overlay then new data
- The API URL uses the IL pattern (`/level/{slug}/{cat}`)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ils/il-detail.tsx
git commit -m "feat: integrate WR History chart into IL leaderboard view"
```
