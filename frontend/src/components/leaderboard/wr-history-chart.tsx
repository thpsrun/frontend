import { useMemo } from "react"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Brush,
} from "recharts"

import { cn } from "@/lib/utils"
import { formatLongDate } from "@/lib/leaderboard-helpers"
import { useWRHistory } from "@/hooks/leaderboard/useWRHistory"

import type { WRHistoryEntry } from "@/types/api"


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



const formatTimeSecs = (secs: number): string => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    const parts: string[] = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0 || parts.length === 0) {
        // Round to 1 decimal to avoid float issues later.
        const rounded = Math.round(s * 10) / 10
        const sStr = rounded % 1 === 0
            ? rounded.toFixed(0)
            : rounded.toFixed(1)
        parts.push(`${sStr}s`)
    }
    return parts.join(" ")
}

const formatDelta = (delta: number): string => {
    const sign = delta < 0 ? "-" : "+"
    const abs = Math.abs(delta)
    const h = Math.floor(abs / 3600)
    const m = Math.floor((abs % 3600) / 60)
    const s = abs % 60

    const sWhole = Math.floor(s)
    const sFrac = Math.round(
        (s - sWhole) * 100,
    ) / 100
    let sStr = sWhole.toString().padStart(2, "0")
    if (sFrac > 0) {
        sStr += sFrac.toFixed(2).slice(1)
    }

    if (h > 0) {
        const mStr = m.toString().padStart(2, "0")
        return `${sign}${h}:${mStr}:${sStr}`
    }
    return `${sign}${m}:${sStr}`
}

// Gets the best URL video to display on the record.
// arch_video > Twitch VOD.
const getVideoUrl = (
    video: string | null,
    archVideo: string | null,
): string | null => {
    const isTwitch = video
        ?.toLowerCase()
        .includes("twitch.tv")
    if (isTwitch && archVideo) {
        return archVideo
    }
    return video ?? archVideo
}

// Oldest run is shown first, with all other runs collapsing.
// Example: Anastasia (+2 Ties)
const processEntries = (
    entries: WRHistoryEntry[],
): ChartDataPoint[] => {
    const points: ChartDataPoint[] = []
    let i = 0

    while (i < entries.length) {
        const entry = entries[i]
        const currentTime = entry.history_time_secs

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
                    <>{" // Delta: "}
                        {formatDelta(data.delta)}
                    </>
                )}
            </div>
        </div>
    )
}


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

    // processEntries appends a synthetic current-date point when data exists, so 1 = no real entries
    const hasData = chartData.length > 1
    const noHistory = data
        && (data.entries?.length ?? 0) === 0

    return (
        <div className={cn(
            "relative border-b border-border/40",
            "px-4 py-4",
        )}>
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

            {noHistory && !isFetching && (
                <div className={cn(
                    "flex items-center justify-center",
                    "h-75",
                )}>
                    <span className={cn(
                        "text-muted-foreground",
                        "text-sm",
                    )}>
                        No WR history available
                    </span>
                </div>
            )}

            {hasData && (
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
                    <LineChart data={chartData}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
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
                            stroke="var(--muted-foreground)"
                            fontSize={12}
                        />
                        <YAxis
                            dataKey="timeSecs"
                            tickFormatter={formatTimeSecs}
                            stroke="var(--muted-foreground)"
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
                        <Brush
                            dataKey="date"
                            height={30}
                            stroke="#22d3ee"
                            fill="var(--background)"
                            tickFormatter={(ts: number) =>
                                new Date(ts)
                                    .getFullYear()
                                    .toString()
                            }
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
