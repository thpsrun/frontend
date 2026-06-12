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
                <div className="min-w-0 bg-background-transparent bg-opacity-10 backdrop-blur-sm rounded-lg flex">
                    <CurrentRecords />
                </div>

                {/* Right column on xl. Below xl it collapses to display:contents
                    so its children join the page's flex-col stack directly — that
                    lets the streaming panel be ordered above CurrentRecords on
                    mobile without disturbing the desktop two-column grid. */}
                <div className="min-w-0 contents xl:flex xl:flex-col xl:gap-3">
                    <div className="min-w-0 order-first xl:order-none">
                        <LiveStreams />
                    </div>

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
