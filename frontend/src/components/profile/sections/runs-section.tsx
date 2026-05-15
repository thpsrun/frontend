import { useMemo, useState } from "react"
import { Link } from "react-router"
import { ExternalLink, Inbox, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    buildLeaderboardPath, getRankBackground, StreakDagger,
} from "@/lib/leaderboard-helpers"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/ui/panel"
import { Switch } from "@/components/ui/switch"
import { EmptyState } from "@/components/ui/empty-state"
import { QueryErrorBanner } from "@/components/ui/query-error-banner"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { EditRunDialog } from "@/components/submissions/edit-run-dialog"
import { cn } from "@/lib/utils"
import { useCurrentPlayer } from "@/hooks/auth/useCurrentPlayer"
import { useAllRunsPaginated } from "@/hooks/runs/useRuns"
import type {
    Run, RunCategoryEmbed, RunGameEmbed, RunLevelEmbed, RunVariableEmbedEntry,
} from "@/types/runs"
import type { PendingRun } from "@/types/submissions"

interface GameGroup {
    name: string
    slug: string
    runs: Run[]
}

const isGameEmbed = (g: Run["game"]): g is RunGameEmbed =>
    typeof g === "object" && g !== null && "slug" in g

const isCategoryEmbed = (c: Run["category"]): c is RunCategoryEmbed =>
    typeof c === "object" && c !== null && "slug" in c

const isLevelEmbed = (l: Run["level"]): l is RunLevelEmbed =>
    typeof l === "object" && l !== null && "slug" in l

const isVariablesEmbed = (
    v: Run["variables"],
): v is RunVariableEmbedEntry[] => Array.isArray(v)

function buildRunLeaderboardPath(run: Run): string | null {
    if (!isGameEmbed(run.game) || !isCategoryEmbed(run.category)) return null
    const valueSlugs = isVariablesEmbed(run.variables)
        ? run.variables.map((entry) => entry.value.slug)
        : []
    const levelSlug = isLevelEmbed(run.level) ? run.level.slug : null
    return buildLeaderboardPath(
        run.game.slug,
        run.category.slug,
        valueSlugs,
        levelSlug,
    )
}

function runToPendingRun(run: Run): PendingRun {
    const game = isGameEmbed(run.game)
        ? { name: run.game.name, slug: run.game.slug }
        : { name: "", slug: "" }
    const category = isCategoryEmbed(run.category)
        ? { name: run.category.name, slug: run.category.slug }
        : { name: "", slug: "" }
    const level = isLevelEmbed(run.level)
        ? { name: run.level.name, slug: run.level.slug }
        : null
    return {
        id: run.id,
        runtype: run.runtype,
        place: run.place,
        points: run.points,
        obsolete: run.obsolete,
        arch_video: run.arch_video,
        subcategory: run.subcategory ?? "",
        times: run.times,
        video: run.video,
        date: run.date,
        v_date: run.v_date,
        url: run.url,
        game,
        category,
        level,
        players: run.players.map((p) => ({
            id: p.id,
            name: p.name,
            countrycode: p.country,
        })),
        vid_status: "",
        description: run.description,
        src_sync: [],
    }
}

function RunRow({ run, idx }: { run: Run; idx: number }) {
    const [editOpen, setEditOpen] = useState(false)
    const stop = (e: React.SyntheticEvent) => e.stopPropagation()
    const time = run.times.p_time && run.times.p_time !== "0"
        ? run.times.p_time
        : run.times.time
    const videoHref = run.arch_video ?? run.video
    const leaderboardPath = buildRunLeaderboardPath(run)
    const categoryLabel = run.subcategory ?? "-"

    return (
        <>
        <TableRow
            className={cn(
                "transition",
                idx % 2 === 1 ? "bg-muted/10" : "",
            )}
        >
            <TableCell className="text-center text-xs">
                <Badge variant={run.runtype === "il" ? "secondary" : "default"}>
                    {run.runtype === "il" ? "IL" : "Full"}
                </Badge>
            </TableCell>
            <TableCell className="text-sm truncate">
                {leaderboardPath ? (
                    <Link
                        to={leaderboardPath}
                        className="text-link hover:underline"
                    >
                        {categoryLabel}
                    </Link>
                ) : categoryLabel}
            </TableCell>
            <TableCell
                className={cn(
                    "font-mono tabular-nums tracking-tight",
                    "text-sm text-center",
                )}
            >
                {time}
            </TableCell>
            <TableCell className="text-center">
                {run.obsolete ? (
                    <Badge variant="outline" className="text-muted-foreground">
                        Obsolete
                    </Badge>
                ) : run.place > 0 ? (
                    <div
                        className={cn(
                            "inline-flex items-center justify-center",
                            "w-8 h-8 rounded-full",
                            "text-xs font-semibold",
                            getRankBackground(run.place),
                        )}
                    >
                        {run.place}
                    </div>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </TableCell>
            <TableCell
                className={cn(
                    "font-mono tabular-nums tracking-tight",
                    "text-sm text-center",
                )}
            >
                {run.points > 0 ? (
                    <>
                        {run.points}
                        <StreakDagger
                            points={run.points}
                            isIl={run.runtype === "il"}
                        />
                    </>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </TableCell>
            <TableCell className="text-xs text-center">
                {run.v_date
                    ? new Date(run.v_date).toLocaleDateString()
                    : new Date(run.date).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <div
                    className={cn(
                        "flex items-center",
                        "justify-center gap-2",
                    )}
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            stop(e)
                            setEditOpen(true)
                        }}
                        className={cn(
                            "inline-flex items-center",
                            "gap-1 text-xs",
                            "text-link hover:underline",
                            "cursor-pointer",
                        )}
                    >
                        <Pencil className="size-3" />
                        Edit
                    </button>
                    {videoHref && (
                        <a
                            href={videoHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}
                            className={cn(
                                "inline-flex items-center",
                                "gap-1 text-xs",
                                "text-link hover:underline",
                            )}
                        >
                            <ExternalLink className="size-3" />
                            Video
                        </a>
                    )}
                    {run.url && (
                        <a
                            href={run.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}
                            className={cn(
                                "inline-flex items-center",
                                "gap-1 text-xs",
                                "text-link hover:underline",
                            )}
                        >
                            <ExternalLink className="size-3" />
                            SRC
                        </a>
                    )}
                </div>
            </TableCell>
        </TableRow>
        <EditRunDialog
            run={runToPendingRun(run)}
            open={editOpen}
            onOpenChange={setEditOpen}
        />
        </>
    )
}

export function RunsSection() {
    const { player, isLoading: playerLoading } = useCurrentPlayer()
    const playerId = player?.player_id
    const [showObsolete, setShowObsolete] = useState(false)

    const {
        data, isLoading, error, refetch,
    } = useAllRunsPaginated(
        {
            player_id: playerId ?? "",
            status: "verified",
            embed: "game,category,level,variables",
        },
        Boolean(playerId),
    )

    const groups: GameGroup[] = useMemo(() => {
        if (!data) return []
        const decorated = data
            .filter((r) => showObsolete || !r.obsolete)
            .map((r) => ({
                run: r,
                ts: r.v_date ? new Date(r.v_date).getTime() : 0,
            }))
            .sort((a, b) => b.ts - a.ts)
        const byGame = new Map<string, GameGroup>()
        for (const { run } of decorated) {
            if (!isGameEmbed(run.game)) continue
            const slug = run.game.slug
            const existing = byGame.get(slug)
            if (existing) {
                existing.runs.push(run)
            } else {
                byGame.set(slug, {
                    name: run.game.name,
                    slug,
                    runs: [run],
                })
            }
        }
        return Array.from(byGame.values())
    }, [data, showObsolete])

    if (playerLoading || isLoading) {
        return (
            <Panel className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">My Runs</h2>
                </div>
                <TableSkeleton
                    columns={6}
                    rows={4}
                    headers={[
                        "Type", "Category", "Time",
                        "Place", "Verified", "Links",
                    ]}
                />
            </Panel>
        )
    }

    if (error) {
        return <QueryErrorBanner error={error} onRetry={refetch} />
    }

    const visibleTotal = groups.reduce((acc, g) => acc + g.runs.length, 0)

    return (
        <div className="space-y-4">
            <Panel className="p-5">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">My Runs</h2>
                    {visibleTotal > 0 && (
                        <Badge variant="secondary">{visibleTotal}</Badge>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <Switch
                            id="show-obsolete"
                            checked={showObsolete}
                            onCheckedChange={setShowObsolete}
                        />
                        <Label
                            htmlFor="show-obsolete"
                            className="text-sm text-muted-foreground"
                        >
                            Show Obsolete
                        </Label>
                    </div>
                </div>

                {groups.length === 0 ? (
                    <EmptyState
                        inset
                        icon={Inbox}
                        title="Uhhhhh...."
                        description="You really shouldn't see this... If you do, uh, please contact Anastasia."
                    />
                ) : (
                    <div className="space-y-6">
                        {groups.map((group) => (
                            <div key={group.slug} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/${group.slug}`}
                                        className={cn(
                                            "text-sm font-semibold",
                                            "text-link hover:underline",
                                        )}
                                    >
                                        {group.name}
                                    </Link>
                                    <Badge variant="secondary">
                                        {group.runs.length}
                                    </Badge>
                                </div>
                                <div
                                    className={cn(
                                        "rounded-md border",
                                        "border-border/40",
                                    )}
                                >
                                    <Table className="table-fixed">
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead className="w-20 text-center">Type</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="w-28 text-center">Time</TableHead>
                                                <TableHead className="w-20 text-center">Place</TableHead>
                                                <TableHead className="w-24 text-center">Points</TableHead>
                                                <TableHead className="w-28 text-center">Verified</TableHead>
                                                <TableHead className="w-44 text-center">Links</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.runs.map((run, idx) => (
                                                <RunRow
                                                    key={run.id}
                                                    run={run}
                                                    idx={idx}
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </div>
    )
}
