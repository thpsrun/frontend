import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"
import type { WRHistoryChartProps } from "./wr-history-chart"

// recharts is a large dependency and the chart only renders when a user opens
// the WR History view, so load it on demand to keep it out of the main bundle.
const WRHistoryChartInner = lazy(() =>
    import("./wr-history-chart").then((m) => ({ default: m.WRHistoryChart })),
)

export function WRHistoryChart(props: WRHistoryChartProps) {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center p-8 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                </div>
            }
        >
            <WRHistoryChartInner {...props} />
        </Suspense>
    )
}
