import { useTHPSNewRuns, useTHPSNewWRs } from "@/hooks/home/useTHPSData"
import { CurrentRecords } from "@/components/home/current-records"
import { LatestRuns } from "@/components/home/latest-runs"
import { LiveStreams } from "@/components/home/live-streams"

export const MainPage = () => {
    const { data: latestRecords } = useTHPSNewWRs()
    const { data: latestRuns } = useTHPSNewRuns()

    return (
        <div className="w-full h-full flex flex-col gap-4 min-w-0">
            <LiveStreams />
            <div
                className={[
                    "flex-1 min-w-0 flex flex-col gap-4",
                    "xl:grid xl:grid-cols-[5fr_3fr] xl:grid-rows-[1fr_1fr]",
                ].join(" ")}
            >
                <div className="min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex xl:col-start-1 xl:row-span-2">
                    <CurrentRecords />
                </div>

                <div className="min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex xl:col-start-2 xl:row-start-1">
                    <LatestRuns title="Latest Records" data={latestRecords} />
                </div>

                <div className="min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex xl:col-start-2 xl:row-start-2">
                    <LatestRuns title="Latest Runs" data={latestRuns} />
                </div>
            </div>
        </div>
    )
}
