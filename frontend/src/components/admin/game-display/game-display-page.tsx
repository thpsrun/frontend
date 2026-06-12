import { useMemo, useState } from "react"
import { Gamepad2 } from "lucide-react"
import { Link } from "react-router"

import { useGames } from "@/hooks/game/useGames"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/empty-state"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import { TableSkeleton } from "@/components/common/table-skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { BACKEND_URL } from "@/constants"
import type { Game } from "@/types/api"

export function GameDisplayPage() {
    const [search, setSearch] = useState("")
    const gamesQuery = useGames()

    const filtered = useMemo<Game[]>(() => {
        const all = gamesQuery.data ?? []
        const needle = search.trim().toLowerCase()
        if (!needle) return all
        return all.filter(
            (g) =>
                g.name.toLowerCase().includes(needle) ||
                g.slug.toLowerCase().includes(needle),
        )
    }, [gamesQuery.data, search])

    return (
        <div className="space-y-4">
            <Panel>
                <div>
                    <h2 className="text-xl font-semibold">Game Display</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose a game and you can manage the main page visibility and what category +
                        subcategories appear, as well as ordering the levels and variable-value pairs.
                    </p>
                </div>
            </Panel>

            {gamesQuery.error && (
                <QueryErrorBanner
                    error={gamesQuery.error}
                    onRetry={gamesQuery.refetch}
                />
            )}

            <Panel className="p-5 space-y-4">
                <Input
                    type="search"
                    placeholder="Search games by name or slug"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                {gamesQuery.isLoading ? (
                    <TableSkeleton
                        columns={3}
                        rows={6}
                        headers={["Game", "Slug", ""]}
                    />
                ) : (
                    <div className="rounded-md border border-border/40 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Game</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead className="w-32 text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="p-0"
                                        >
                                            <EmptyState
                                                inset
                                                icon={Gamepad2}
                                                title={
                                                    search
                                                        ? "No games match that search."
                                                        : "No games to display."
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((game) => (
                                        <TableRow key={game.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {/* boxart is a backend-relative media path, so prefix the backend origin. */}
                                                    {game.boxart && (
                                                        <img
                                                            src={`${BACKEND_URL}${game.boxart}`}
                                                            alt=""
                                                            className="h-10 w-8 rounded object-cover"
                                                        />
                                                    )}
                                                    <span className="font-medium">
                                                        {game.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {game.slug}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    to={`/admin/game-display/${game.id}`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Panel>
        </div>
    )
}
