import { useTHPSNewRuns, useTHPSNewWRs } from "@/hooks/home/useTHPSData"
import { CurrentRecords } from "@/components/home/current-records"
import { LatestRuns } from "@/components/home/latest-runs"
import { LiveStreams } from "@/components/home/live-streams"

export const MainPage = () => {
    const { data: latestRecords } = useTHPSNewWRs()
    const { data: latestRuns } = useTHPSNewRuns()

    return (
        <div className="w-full h-full flex flex-col gap-4 xl:flex-row min-w-0">
            <div className="xl:flex-2 min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                <CurrentRecords />
            </div>

            <div className="xl:flex-1 min-w-0 flex flex-col gap-4">
                <LiveStreams />

                <div className="flex-1 min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                    <LatestRuns title="Latest Records" data={latestRecords} />
                </div>

                <div className="flex-1 min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                    <LatestRuns title="Latest Runs" data={latestRuns} />
                </div>
            </div>
        </div>
    )
}
