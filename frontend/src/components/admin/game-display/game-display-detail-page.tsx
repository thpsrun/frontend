import { ArrowLeft, RefreshCw } from "lucide-react"
import { Link, useParams } from "react-router"

import { useGameDisplay } from "@/hooks/admin/useGameDisplay"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/ui/query-error-banner"
import { cn } from "@/lib/utils"

import { GameDisplayEditor } from "./game-display-editor"

export function GameDisplayDetailPage() {
    const { gameId } = useParams<{ gameId: string }>()

    if (!gameId) {
        return (
            <QueryErrorBanner
                error={new Error("Missing game ID in URL.")}
                onRetry={() => {}}
            />
        )
    }

    return <GameDisplayDetail gameId={gameId} />
}

function GameDisplayDetail({ gameId }: { gameId: string }) {
    const displayQuery = useGameDisplay(gameId)
    const data = displayQuery.data

    return (
        <div className="space-y-4">
            <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/game-display">
                            <Button size="sm" variant="ghost" className="gap-1">
                                <ArrowLeft className="size-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold">
                                {data ? data.game_name : "Game Display"}
                            </h2>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => displayQuery.refetch()}
                        disabled={displayQuery.isFetching}
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                displayQuery.isFetching && "animate-spin",
                            )}
                        />
                        Refresh
                    </Button>
                </div>
            </Panel>

            <GameDisplayEditor gameId={gameId} />
        </div>
    )
}
