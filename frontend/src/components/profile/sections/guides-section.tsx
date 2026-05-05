import { useState } from "react"
import { Link } from "react-router"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
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
            <Panel>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">My Guides</h2>
                    </div>
                    <Button asChild>
                        <Link to="/guides/new">
                            <Plus className="mr-2 size-4" />New Guide
                        </Link>
                    </Button>
                </div>
            </Panel>

            <Panel className="p-3">
                <GuidesTableFilters onChange={setFilters} />
            </Panel>

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
