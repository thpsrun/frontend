import { useState } from "react"
import { Link } from "react-router"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import { useSession } from "@/hooks/auth/useSession"
import { useGameDetail } from "@/hooks/game/useGameDetail"
import { GuidesTableFilters, type FiltersState } from "./guides-table-filters"
import { GuidesTable } from "./guides-table"

interface Props {
    pinnedGameSlug?: string
}

export function GuidesHubPage({ pinnedGameSlug }: Props) {
    useDocumentTitle("Guides", { enabled: !pinnedGameSlug })
    const { isAuthenticated } = useSession()
    const gameDetail = useGameDetail(pinnedGameSlug ?? "")
    const [filters, setFilters] = useState<FiltersState>({
        game: undefined,
        tagSlugs: [],
        query: "",
    })

    const heading = pinnedGameSlug
        ? `Guides - ${gameDetail.data?.name ?? pinnedGameSlug}`
        : "Guides"

    return (
        <div className="container mx-auto max-w-6xl px-4 space-y-4">
            <Panel className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold">{heading}</h1>
                    </div>
                    {isAuthenticated && (
                        <Button asChild>
                            <Link
                                to={pinnedGameSlug
                                    ? `/guides/new?game=${encodeURIComponent(pinnedGameSlug)}`
                                    : "/guides/new"}
                            >
                                <Plus className="mr-2 size-4" />New Guide
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="border-t border-border/60 pt-3">
                    <GuidesTableFilters
                        pinnedGameSlug={pinnedGameSlug}
                        onChange={setFilters}
                    />
                </div>
            </Panel>

            <GuidesTable
                pinnedGameSlug={pinnedGameSlug}
                filters={filters}
            />
        </div>
    )
}
