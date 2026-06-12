import { useMemo, useState } from "react"
import type { SyntheticEvent } from "react"
import { Link } from "react-router"
import { useSubmissions } from "@/hooks/submissions/useSubmissions"
import { Badge } from "@/components/ui/badge"
import { Panel } from "@/components/ui/panel"
import { QueryErrorBanner } from "@/components/common/query-error-banner"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/common/table-skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { PageShell } from "@/components/common/page-shell"
import { PlayerLink } from "@/components/common/player-link"
import { Info, ExternalLink, Inbox, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    SyncStatusBadge,
} from "@/components/submissions/sync-status-badge"
import { EditRunDialog } from "@/components/submissions/edit-run-dialog"
import {
    ChangePlayersDialog,
} from "@/components/submissions/change-players-dialog"
import { ReviewGroupsSection } from "@/components/submissions/review-groups-section"
import { VidStatusBadge } from "@/components/submissions/vid-status-badge"
import type { PendingRun, ReviewGameGroup } from "@/types/submissions"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

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

    const stop = (e: SyntheticEvent) => e.stopPropagation()

    return (
        <>
            <TableRow
                className={cn(
                    "transition cursor-pointer hover:bg-muted/40",
                    idx % 2 === 1 ? "bg-muted/10" : "",
                )}
                onClick={() => setEditOpen(true)}
            >
                <TableCell className="text-sm whitespace-normal wrap-break-word">
                    {run.subcategory}
                </TableCell>
                <TableCell className="text-sm">
                    {run.players.map((p, i) => (
                        <span key={p.id}>
                            {i > 0 && ", "}
                            <PlayerLink
                                name={p.name}
                                target="_blank"
                                onClick={stop}
                                className="text-link"
                            />
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
                    <div className={cn(
                        "flex flex-col items-center justify-center",
                        "gap-1",
                    )}>
                        <VidStatusBadge status={run.vid_status} />
                        <SyncStatusBadge sync={run.src_sync} />
                        {run.has_import_issues && (
                            <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="size-3" />
                                Issues
                            </Badge>
                        )}
                    </div>
                </TableCell>
            </TableRow>

            <EditRunDialog
                run={run}
                isMine={isMine}
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

function groupByGame(rows: RowData[]): GameGroup[] {
    const byGame = new Map<string, GameGroup>()
    for (const row of rows) {
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
    return Array.from(byGame.values())
        .sort((a, b) => a.name.localeCompare(b.name))
}

function GroupedRunsPanel({
    title, groups, totalCount,
}: {
    title: string
    groups: GameGroup[]
    totalCount: number
}) {
    if (groups.length === 0) return null
    return (
        <Panel className="p-5">
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <Badge variant="secondary">{totalCount}</Badge>
            </div>
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
                            "rounded-md border overflow-x-auto",
                            "border-border/40",
                        )}>
                            <Table className="table-fixed min-w-160">
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="text-center">Category</TableHead>
                                        <TableHead className="text-center w-65">Players</TableHead>
                                        <TableHead className="text-center w-24">Time</TableHead>
                                        <TableHead className="text-center w-28">Date</TableHead>
                                        <TableHead className="text-center w-28">Links</TableHead>
                                        <TableHead className="text-center w-45">Status</TableHead>
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
        </Panel>
    )
}

export function SubmissionsHub() {
    useDocumentTitle("Submissions")
    const { data, isLoading, error, refetch } = useSubmissions()

    const {
        myGroups, myCount,
        modGroups, modCount,
        reviewGroupsFiltered,
    } = useMemo(() => {
        if (!data) {
            return {
                myGroups: [] as GameGroup[],
                myCount: 0,
                modGroups: [] as GameGroup[],
                modCount: 0,
                reviewGroupsFiltered: [] as ReviewGameGroup[],
            }
        }

        const myRows: RowData[] = data.pending_runs.map((run) => ({
            run,
            isMine: true,
            isModerating: false,
        }))
        const mineIds = new Set(myRows.map((r) => r.run.id))

        // A moderator's own run shows up in both their pending runs and their moderation queue.
        // List it once under "Your Pending Runs" but flag it so moderator controls still apply.
        for (const group of data.moderation_queue ?? []) {
            for (const run of group.pending_runs) {
                if (mineIds.has(run.id)) {
                    const existing = myRows.find((r) => r.run.id === run.id)
                    if (existing) existing.isModerating = true
                }
            }
        }

        const modRows: RowData[] = []
        for (const group of data.moderation_queue ?? []) {
            for (const run of group.pending_runs) {
                if (mineIds.has(run.id)) continue
                modRows.push({
                    run,
                    isMine: false,
                    isModerating: true,
                })
            }
        }

        // Same de-depe for the sent-back section: runs the user owns stay in their personal list
        // instead of appearing twice.
        const reviewGroupsFiltered = (data.review_groups ?? [])
            .map((g) => ({
                ...g,
                pending_runs: g.pending_runs.filter(
                    (r) => !mineIds.has(r.id),
                ),
            }))
            .filter((g) => g.pending_runs.length > 0)

        return {
            myGroups: groupByGame(myRows),
            myCount: myRows.length,
            modGroups: groupByGame(modRows),
            modCount: modRows.length,
            reviewGroupsFiltered,
        }
    }, [data])

    if (isLoading) {
        return (
            <PageShell>
                <Panel className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-semibold">
                            Your Pending Runs
                        </h2>
                    </div>
                    <TableSkeleton
                        columns={6}
                        rows={4}
                        headers={[
                            "Category", "Players",
                            "Time", "Date", "Links", "Status",
                        ]}
                    />
                </Panel>
            </PageShell>
        )
    }

    if (error) {
        return (
            <PageShell spacing="none">
                <QueryErrorBanner error={error} onRetry={refetch} />
            </PageShell>
        )
    }

    return (
        <PageShell>
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
                        SRC
                    </a>{" "}
                    automatically.
                </span>
            </Panel>

            <GroupedRunsPanel
                title="Your Pending Runs"
                groups={myGroups}
                totalCount={myCount}
            />

            <GroupedRunsPanel
                title="Moderation Queue"
                groups={modGroups}
                totalCount={modCount}
            />

            {myCount === 0 && modCount === 0 && (
                <Panel className="p-5">
                    <EmptyState
                        inset
                        icon={Inbox}
                        title="No Pending Runs"
                        description="Submitted runs will show here while they wait on moderators to approve, deny, or send back the runs for comments."
                    />
                </Panel>
            )}

            <ReviewGroupsSection groups={reviewGroupsFiltered} />
        </PageShell>
    )
}
