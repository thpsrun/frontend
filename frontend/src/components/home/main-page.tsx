import { useTHPSNewRuns, useTHPSNewWRs } from "@/hooks/home/useTHPSData"
import { CurrentRecords } from "@/components/home/current-records"
import { LatestRuns } from "@/components/home/latest-runs"
import { LiveStreams } from "@/components/home/live-streams"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

export const MainPage = () => {
    useDocumentTitle()
    const { data: latestRecords } = useTHPSNewWRs()
    const { data: latestRuns } = useTHPSNewRuns()

    return (
        <div className="w-full h-full flex flex-col gap-4 min-w-0">
            <div
                className={[
                    "flex-1 min-w-0 flex flex-col gap-3",
                    "xl:grid xl:grid-cols-[5fr_3fr] xl:items-start",
                ].join(" ")}
            >
                {/* Streaming: first in DOM so it sits at the top on mobile;
                    pinned to the top of the right column on xl+ */}
                <div className="min-w-0 xl:col-start-2 xl:row-start-1">
                    <LiveStreams />
                </div>

                <div className="min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex xl:col-start-1 xl:row-start-1 xl:row-span-2">
                    <CurrentRecords />
                </div>

                <div className="min-w-0 flex flex-col gap-3 xl:col-start-2 xl:row-start-2">
                    <div className="min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                        <LatestRuns title="Latest Records" data={latestRecords} />
                    </div>

                    <div className="min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                        <LatestRuns title="Latest Runs" data={latestRuns} />
                    </div>
                </div>
            </div>
        </div>
    )
}
