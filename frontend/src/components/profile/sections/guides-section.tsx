import { useState } from "react"
import { Link } from "react-router"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { GuidesTableFilters, type FiltersState } from "@/components/guides/guides-table-filters"
import { GuidesTable } from "@/components/guides/guides-table"

export function GuidesSection() {
    const { player } = useCurrentPlayer()
    const username = player?.player.username
    const [filters, setFilters] = useState<FiltersState>({
        game: undefined,
        tagSlugs: [],
        query: "",
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">My guides</h2>
                    <p className="text-sm text-muted-foreground">
                        The guides you've written.
                    </p>
                </div>
                <Button asChild>
                    <Link to="/guides/new">
                        <Plus className="mr-2 size-4" />New guide
                    </Link>
                </Button>
            </div>

            <GuidesTableFilters onChange={setFilters} />
            {/* TODO(backend): switch to ?author=<username> once available; today we filter client-side */}
            <GuidesTable
                pinnedAuthorUsername={username}
                filters={filters}
                emptyState={{
                    title: "You haven't written any guides yet.",
                    action: (
                        <Button asChild>
                            <Link to="/guides/new">
                                <Plus className="mr-2 size-4" />Write your first guide
                            </Link>
                        </Button>
                    ),
                }}
            />
        </div>
    )
}
