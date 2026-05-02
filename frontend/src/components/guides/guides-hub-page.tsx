import { useState } from "react"
import { Link } from "react-router"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/auth/useSession"
import { useGameDetail } from "@/hooks/game/useGameDetail"
import { GuidesTableFilters, type FiltersState } from "./guides-table-filters"
import { GuidesTable } from "./guides-table"

interface Props {
    pinnedGameSlug?: string
}

export function GuidesHubPage({ pinnedGameSlug }: Props) {
    const { isAuthenticated } = useSession()
    const gameDetail = useGameDetail(pinnedGameSlug ?? "")
    const [filters, setFilters] = useState<FiltersState>({
        game: undefined,
        tagSlugs: [],
        query: "",
    })

    const heading = pinnedGameSlug
        ? `Guides — ${gameDetail.data?.name ?? pinnedGameSlug}`
        : "Guides"

    return (
        <div className="container mx-auto max-w-6xl px-4 py-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">{heading}</h1>
                    <p className="text-sm text-muted-foreground">
                        Strategy notes, route writeups, and reference material.
                    </p>
                </div>
                {isAuthenticated && (
                    <Button asChild>
                        <Link to="/guides/new">
                            <Plus className="mr-2 size-4" />New guide
                        </Link>
                    </Button>
                )}
            </div>

            <div className="mb-3">
                <GuidesTableFilters
                    pinnedGameSlug={pinnedGameSlug}
                    onChange={setFilters}
                />
            </div>

            <GuidesTable
                pinnedGameSlug={pinnedGameSlug}
                filters={filters}
                emptyState={{
                    title: "No guides yet.",
                    description: isAuthenticated
                        ? "Be the first to share what you know."
                        : "Sign in to write a guide.",
                    action: isAuthenticated
                        ? (
                            <Button asChild>
                                <Link to="/guides/new">
                                    <Plus className="mr-2 size-4" />Create the first guide
                                </Link>
                            </Button>
                        )
                        : undefined,
                }}
            />
        </div>
    )
}
