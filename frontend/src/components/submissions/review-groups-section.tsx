import { useState } from "react"
import type { SyntheticEvent } from "react"
import { Link } from "react-router"
import { ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Panel } from "@/components/ui/panel"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ReviewNotesBanner } from "@/components/submissions/review-notes-banner"
import { VidStatusBadge } from "@/components/submissions/vid-status-badge"
import { EditRunDialog } from "@/components/submissions/edit-run-dialog"
import { cn } from "@/lib/utils"
import type { PendingRun, ReviewGameGroup } from "@/types/submissions"

interface Props {
    groups: ReviewGameGroup[]
}

export function ReviewGroupsSection({ groups }: Props) {
    if (groups.length === 0) return null

    const total = groups.reduce((sum, g) => sum + g.pending_runs.length, 0)

    return (
        <Panel className="p-5">
            <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold">
                    Awaiting User Response
                </h2>
                {total > 0 && (
                    <Badge variant="secondary">{total}</Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Runs you've sent back to runners for changes.
            </p>

            <div className="space-y-6">
                {groups.map((group) => (
                    <div key={group.game_slug} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/${group.game_slug}`}
                                className={cn(
                                    "text-sm font-semibold",
                                    "text-link hover:underline",
                                )}
                            >
                                {group.game_name}
                            </Link>
                            <Badge variant="secondary">
                                {group.pending_runs.length}
                            </Badge>
                        </div>
                        <div className={cn(
                            "rounded-md border overflow-x-auto",
                            "border-border/40",
                        )}>
                            <Table className="table-fixed min-w-160">
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="text-center w-45">Status</TableHead>
                                        <TableHead className="text-center">Category</TableHead>
                                        <TableHead className="text-center w-65">Players</TableHead>
                                        <TableHead className="text-center w-24">Time</TableHead>
                                        <TableHead className="text-center w-28">Date</TableHead>
                                        <TableHead className="text-center w-28">Links</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {group.pending_runs.map((run, idx) => (
                                        <ReviewRow
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
        </Panel>
    )
}

function ReviewRow({ run, idx }: { run: PendingRun; idx: number }) {
    const [editOpen, setEditOpen] = useState(false)

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
                <TableCell className="text-center">
                    <VidStatusBadge status={run.vid_status} />
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
                                className={cn("text-link hover:underline")}
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
                                    "inline-flex items-center gap-1 text-xs",
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
                                    "inline-flex items-center gap-1 text-xs",
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
            <TableRow>
                <TableCell colSpan={6} className="bg-muted/10">
                    <div onClick={stop}>
                        <ReviewNotesBanner
                            notes={run.review_notes}
                            canResubmit={false}
                            runId={run.id}
                        />
                    </div>
                </TableCell>
            </TableRow>

            <EditRunDialog
                run={run}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    )
}
