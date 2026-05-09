import { useMemo, useState } from "react"
import { Link } from "react-router"
import { useSubmissions } from "@/hooks/submissions/useSubmissions"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Panel } from "@/components/ui/panel"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Info, ExternalLink, RotateCcw, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    SyncStatusBadge,
} from "@/components/submissions/sync-status-badge"
import { EditRunDialog } from "@/components/submissions/edit-run-dialog"
import {
    ChangePlayersDialog,
} from "@/components/submissions/change-players-dialog"
import type { PendingRun } from "@/types/submissions"

interface RowData {
    run: PendingRun
    isMine: boolean
    isModerating: boolean
}

function PendingRunRow({
    row,
    idx,
}: {
    row: RowData
    idx: number
}) {
    const { run, isMine, isModerating } = row
    const [editOpen, setEditOpen] = useState(false)
    const [playersOpen, setPlayersOpen] = useState(false)

    const stop = (e: React.SyntheticEvent) => e.stopPropagation()

    return (
        <>
            <TableRow
                className={cn(
                    "transition cursor-pointer hover:bg-muted/40",
                    idx % 2 === 1 ? "bg-muted/10" : "",
                )}
                onClick={() => setEditOpen(true)}
            >
                <TableCell className="text-center">
                    {isMine ? (
                        <Badge variant="secondary">Mine</Badge>
                    ) : isModerating ? (
                        <Badge>Mod</Badge>
                    ) : null}
                </TableCell>
                <TableCell className="text-sm">
                    {run.subcategory}
                </TableCell>
                <TableCell className="text-sm">
                    {run.players.map((p, i) => (
                        <span key={p.id}>
                            {i > 0 && ", "}
                            <Link
                                to={`/player/${p.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stop}
                                className={cn(
                                    "text-link",
                                    "hover:underline",
                                )}
                            >
                                {p.name}
                            </Link>
                        </span>
                    ))}
                </TableCell>
                <TableCell className={cn(
                    "font-mono tabular-nums tracking-tight",
                    "text-sm text-center",
                )}>
                    {run.times.p_time}
                </TableCell>
                <TableCell className="text-xs text-center">
                    {new Date(run.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                    <div className={cn(
                        "flex items-center",
                        "justify-center gap-2",
                    )}>
                        {run.video && (
                            <a
                                href={run.video}
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
                <TableCell className="text-center">
                    <SyncStatusBadge sync={run.src_sync} />
                </TableCell>
            </TableRow>

            <EditRunDialog
                run={run}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
            {isModerating && (
                <ChangePlayersDialog
                    run={run}
                    open={playersOpen}
                    onOpenChange={setPlayersOpen}
                />
            )}
        </>
    )
}

interface GameGroup {
    name: string
    slug: string
    rows: RowData[]
}

export function SubmissionsHub() {
    const { data, isLoading, error, refetch } = useSubmissions()

    const { rows, groups } = useMemo(() => {
        if (!data) return { rows: [] as RowData[], groups: [] as GameGroup[] }
        const byId = new Map<string, RowData>()

        for (const run of data.pending_runs) {
            byId.set(run.id, {
                run,
                isMine: true,
                isModerating: false,
            })
        }
        for (const group of data.moderation_queue ?? []) {
            for (const run of group.pending_runs) {
                const existing = byId.get(run.id)
                if (existing) {
                    existing.isModerating = true
                } else {
                    byId.set(run.id, {
                        run,
                        isMine: false,
                        isModerating: true,
                    })
                }
            }
        }

        const flat = Array.from(byId.values())

        const byGame = new Map<string, GameGroup>()
        for (const row of flat) {
            const slug = row.run.game.slug
            const existing = byGame.get(slug)
            if (existing) {
                existing.rows.push(row)
            } else {
                byGame.set(slug, {
                    name: row.run.game.name,
                    slug,
                    rows: [row],
                })
            }
        }

        const sortedGroups = Array.from(byGame.values())
            .sort((a, b) => a.name.localeCompare(b.name))

        return { rows: flat, groups: sortedGroups }
    }, [data])

    if (isLoading) {
        return (
            <div className={cn(
                "mx-auto max-w-5xl px-4 py-8",
                "space-y-6",
            )}>
                <Panel className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-semibold">
                            Pending Runs
                        </h2>
                    </div>
                    <TableSkeleton
                        columns={7}
                        rows={4}
                        headers={[
                            "Type", "Category", "Players",
                            "Time", "Date", "Links", "Sync",
                        ]}
                    />
                </Panel>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <AlertBanner variant="error">
                    <div className="flex items-center justify-between gap-3">
                        <span>{error.message}</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refetch()}
                            className="gap-1 shrink-0"
                        >
                            <RotateCcw className="size-3" />
                            Retry
                        </Button>
                    </div>
                </AlertBanner>
            </div>
        )
    }

    return (
        <div className={cn(
            "mx-auto max-w-5xl px-4 py-8",
            "space-y-6",
        )}>
            <Panel className="flex items-start gap-2.5 px-4 py-3 text-sm text-muted-foreground">
                <Info className={cn(
                    "size-4 mt-0.5 shrink-0",
                    "text-link",
                )} />
                <span>
                    Click any pending run to edit its details. Changes sync back to{" "}
                    <a
                        href="https://www.speedrun.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn("text-link hover:underline")}
                    >
                        speedrun.com
                    </a>{" "}
                    automatically.
                </span>
            </Panel>

            <Panel className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">
                        Pending Runs
                    </h2>
                    {rows.length > 0 && (
                        <Badge variant="secondary">
                            {rows.length}
                        </Badge>
                    )}
                </div>

                {groups.length === 0 ? (
                    <EmptyState
                        inset
                        icon={Inbox}
                        title="No pending runs"
                        description="Submitted runs will show here while they wait on moderators."
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
                                        {group.rows.length}
                                    </Badge>
                                </div>
                                <div className={cn(
                                    "rounded-md border",
                                    "border-border/40",
                                )}>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead className="text-center">Type</TableHead>
                                                <TableHead className="text-center">Category</TableHead>
                                                <TableHead className="text-center">Players</TableHead>
                                                <TableHead className="text-center">Time</TableHead>
                                                <TableHead className="text-center">Date</TableHead>
                                                <TableHead className="text-center">Links</TableHead>
                                                <TableHead className="text-center">Sync</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.rows.map((row, idx) => (
                                                <PendingRunRow
                                                    key={row.run.id}
                                                    row={row}
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
