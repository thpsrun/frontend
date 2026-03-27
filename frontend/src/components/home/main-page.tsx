import { useTHPSNewRuns, useTHPSNewWRs } from "@/hooks/home/useTHPSData"
import { CurrentRecords } from "@/components/home/current-records"
import { LatestRuns } from "@/components/home/latest-runs"

export const MainPage = () => {
    const { data: latestRecords } = useTHPSNewWRs()
    const { data: latestRuns } = useTHPSNewRuns()

    return (
        <div className="w-full h-full flex gap-4">
            <div className="flex-[2] bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                <CurrentRecords />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                    <LatestRuns title="Latest Records" data={latestRecords} />
                </div>

                <div className="flex-1 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                    <LatestRuns title="Latest Runs" data={latestRuns} />
                </div>
            </div>
        </div>
    )
}
